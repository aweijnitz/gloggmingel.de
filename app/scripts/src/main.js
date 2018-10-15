$(document).ready(function () {
    console.log('Ready');

    Amplitude.init({
        "songs": [
            {
                "name": "Song Name 1",
                "artist": "Artist Name",
                "album": "Album Name",
                "url": "https://xn--glggmingel-fcb.de/tracks/feliz_navidad_20071118.mp3",
                "cover_art_url": "/cover/art/url.jpg"
            },
            {
                "name": "Song Name 2",
                "artist": "Artist Name",
                "album": "Album Name",
                "url": "https://xn--glggmingel-fcb.de/tracks/all_i_want_for_xmas_20071113.mp3",
                "cover_art_url": "/cover/art/url.jpg"
            },
            {
                "name": "Song Name 3",
                "artist": "Artist Name",
                "album": "Album Name",
                "url": "https://xn--glggmingel-fcb.de/tracks/ukeduo_have_yourself_a_merry_little_christmas.mp3",
                "cover_art_url": "/cover/art/url.jpg"
            }
        ]
    });
});
