/* ==========================================================
   SITE SETTINGS  —  where the "Watch now" button goes
   ----------------------------------------------------------
   {q} is replaced with the anime title. Change the domain here
   if it ever moves; nothing else needs editing.
   ========================================================== */

const SITE = {
  watchUrl:  'https://anikoto.net/search?keyword={q}',
  watchName: 'Anikoto',

  /* Optional. Lets the Find page identify a song from a recording.
     Free key from https://audd.io — leave empty to skip. Typing a lyric
     or title on the Find page works without it. */
  auddToken: 'de6207d11edb63abbf75dca937f0c68e'
};
