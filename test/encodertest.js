const {encode, decode} = require('gpt-3-encoder')

const str = `This is an example sentence to try encoding out on!


Please write a script for a scene from a sitcom about three friends with very different personalities that barely get along. Greg is a tech bro software developer, know-it-all that's always thinking of new app ideas. Tina is a hipster that's always cracking wise. Bob is a veteran that is always espousing wild conspiracy theories and encouraging everyone to prepare for an apocalypse. Sal is a no-nonsense cop that's always giving the trio a hard time.

Props in the scene: {props}
Character actions: entrance (character), exit (character), pickup (prop), use (prop), siton (prop), standup, turntoface (character or prop), laugh, cry, nod, walkto (character or prop). 
Sounds: audience small laugh, audience medium laugh, audience large laugh, audience clap, audience gasps, audience awww

In my short example scene, formatted as YaML, Tina sits down to eat a hotdog, then makes a bad pun.:
-
 type: act
 mode: siton
 source: Tina
 target: picnic bench
-
 type: act
 mode: pickup
 source: Tina
 target: hotdog
-
 type: act
 mode: use
 source: Tina
 target: hotdog
-
 type: dia
 source: Tina
 content: What's up, hotdog?
-
 type: snd
 content: audience small laugh

In your scene, {characters} are at the {location} and {situation}:








`;
console.log(encode(str).length);
//console.log('Encoded this string looks like: ' + encoded + ' which has ' + encoded.length + ' tokens');