from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
import re
from bs4 import BeautifulSoup
import models
from auth_utils import get_current_admin

router = APIRouter(prefix="/import", tags=["import"])


class ImportRequest(BaseModel):
    url: str


class ImportedSong(BaseModel):
    title: str
    artist: str
    key: Optional[str] = None
    content: str
    youtube_url: Optional[str] = None
    source_url: str


def extract_key_from_content(content: str) -> Optional[str]:
    """Try to detect the key/tono from chord content."""
    # Common patterns for first chord
    lines = content.split('\n')
    for line in lines:
        chords = re.findall(r'\[([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?(?:\d+)?)\]', line)
        if chords:
            return chords[0]
    return None


async def import_from_cifraclub(url: str) -> ImportedSong:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-ES,es;q=0.9,pt;q=0.8,en;q=0.7',
    }
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30) as client:
        response = await client.get(url)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, 'lxml')

    # Extract title and artist
    title = ""
    artist = ""

    h1 = soup.find('h1', class_='t1') or soup.find('h1')
    h2 = soup.find('h2', class_='t3') or soup.find('h2')

    if h1:
        title = h1.get_text(strip=True)
    if h2:
        artist = h2.get_text(strip=True)

    # Try meta tags as fallback
    if not title:
        og_title = soup.find('meta', property='og:title')
        if og_title:
            title_text = og_title.get('content', '')
            parts = title_text.split(' - ')
            if len(parts) >= 2:
                title = parts[0].strip()
                artist = parts[1].strip()

    # Extract chord content from cifraclub
    content_lines = []
    pre_tag = soup.find('pre', class_='cifra') or soup.find('pre')

    if pre_tag:
        # Process the pre tag to extract chords and lyrics
        # CifraClub uses <b> tags for chords inline
        raw_text = pre_tag.decode_contents()
        # Convert <b>CHORD</b> to [CHORD] format
        raw_text = re.sub(r'<b>([^<]+)</b>', r'[\1]', raw_text)
        # Remove remaining HTML tags
        clean_text = BeautifulSoup(raw_text, 'lxml').get_text()
        content_lines = clean_text
    else:
        # Alternative: look for chord sections
        chord_div = soup.find('div', class_='cifra_cnt') or soup.find('div', id='song-content')
        if chord_div:
            content_lines = chord_div.get_text()
        else:
            content_lines = "# Importación manual requerida\n\nNo se pudo extraer el contenido automáticamente.\nPega la letra con acordes aquí en formato:\n\n[G]Esta es la [C]letra de la [D]canción"

    key = extract_key_from_content(content_lines)

    return ImportedSong(
        title=title or "Sin título",
        artist=artist or "Sin artista",
        key=key,
        content=content_lines,
        source_url=url
    )


async def import_from_ultimate_guitar(url: str) -> ImportedSong:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30) as client:
        response = await client.get(url)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, 'lxml')

    title = ""
    artist = ""
    content = ""

    # UG stores data in a JS variable
    scripts = soup.find_all('script')
    for script in scripts:
        if script.string and 'window.UGAPP.store.page' in script.string:
            # Extract JSON data
            match = re.search(r'window\.UGAPP\.store\.page\s*=\s*({.*?});', script.string, re.DOTALL)
            if match:
                import json
                try:
                    data = json.loads(match.group(1))
                    tab_data = data.get('data', {}).get('tab', {})
                    tab_view = data.get('data', {}).get('tab_view', {})
                    title = tab_data.get('song_name', '')
                    artist = tab_data.get('artist_name', '')
                    wiki_tab = tab_view.get('wiki_tab', {})
                    if wiki_tab:
                        content = wiki_tab.get('content', '')
                        # UG format uses [ch] tags for chords
                        content = re.sub(r'\[ch\]([^\[]+)\[/ch\]', r'[\1]', content)
                        content = re.sub(r'\[tab\]', '', content)
                        content = re.sub(r'\[/tab\]', '', content)
                except:
                    pass
            break

    if not content:
        # Fallback: try to find chord notation in pre tags
        pre = soup.find('pre')
        if pre:
            content = pre.get_text()

    if not title:
        og_title = soup.find('meta', property='og:title')
        if og_title:
            title = og_title.get('content', 'Sin título')

    key = extract_key_from_content(content)

    return ImportedSong(
        title=title or "Sin título",
        artist=artist or "Sin artista",
        key=key,
        content=content or "# No se pudo extraer el contenido. Pega la letra con acordes manualmente.",
        source_url=url
    )


@router.post("/", response_model=ImportedSong)
async def import_song(
    request: ImportRequest,
    current_user: models.User = Depends(get_current_admin)
):
    url = request.url.strip()

    if not url.startswith('http'):
        raise HTTPException(status_code=400, detail="URL inválida")

    try:
        if 'cifraclub' in url:
            result = await import_from_cifraclub(url)
        elif 'ultimate-guitar' in url or 'tabs.ultimate-guitar' in url:
            result = await import_from_ultimate_guitar(url)
        else:
            raise HTTPException(
                status_code=400,
                detail="URL no soportada. Solo CifraClub y Ultimate Guitar."
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al importar: {str(e)}"
        )
