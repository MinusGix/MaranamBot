let characters = [
    ['kya', 'きゃ'],
    ['kyu', 'きゅ'],
    ['kyo', 'きょ'],
    ['sha', 'しゃ'],
    ['shu', 'しゅ'],
    ['sho', 'しょ'],
    ['cha', 'ちゃ'],
    ['chu', 'ちゅ'],
    ['cho', 'ちょ'],
    ['nya', 'にゃ'],
    ['nyu', 'にゅ'],
    ['nyo', 'にょ'],
    ['hya', 'ひゃ'],
    ['hyu', 'ひゅ'],
    ['hyo', 'ひょ'],
    ['mya', 'みゃ'],
    ['myu', 'みゅ'],
    ['myo', 'みょ'],
    ['rya', 'りゃ'],
    ['ryu', 'りゅ'],
    ['ryo', 'りょ'],
    ['gya', 'ぎゃ'],
    ['gyu', 'ぎゅ'],
    ['gyo', 'ぎょ'],
    ['ja', 'じゃ'],
    ['ju', 'じゅ'],
    ['jo', 'じょ'],
    ['dja', 'ぢゃ'],
    ['dju', 'ぢゅ'],
    ['djo', 'ぢょ '],
    ['bya', 'びゃ'],
    ['byu', 'びゅ'],
    ['byo', 'びょ'],
    ['pya', 'ぴゃ'],
    ['byu', 'びゅ'],
    ['pyo', 'ぴょ'],
    ['ga', 'が'],
    ['gi', 'ぎ'],
    ['gu', 'ぐ'],
    ['ge', 'げ'],
    ['go', 'ご'],
    ['za', 'ざ'],
    ['ji', 'じ'],
    ['zu', 'ず'],
    ['ze', 'ぜ'],
    ['zo', 'ぞ'],
    ['da', 'だ'],
    ['dji', 'ぢ'],
    ['dzu', 'づ'],
    ['de', 'で'],
    ['do', 'ど'],
    ['ba', 'ば'],
    ['bi', 'び'],
    ['bu', 'ぶ'],
    ['be', 'べ'],
    ['bo', 'ぼ'],
    ['pa', 'ぱ'],
    ['pi', 'ぴ'],
    ['pu', 'ぷ'],
    ['pe', 'ぺ'],
    ['po', 'ぽ'],


    ['o', 'お'],
    ['e', 'え'],
    ['u', 'う'],
    ['i', 'い'],
    ['a', 'あ'],
    ['ko', 'こ'],
    ['ke', 'け'],
    ['ku', 'く'],
    ['ki', 'き'],
    ['ka', 'か'],
    ['so', 'そ'],
    ['se', 'せ'],
    ['su', 'す'],
    ['shi', 'し'],
    ['sa', 'さ'],
    ['to', 'と'],
    ['te', 'て'],
    ['tsu', 'つ'],
    ['chi', 'ち'],
    ['ta', 'た'],
    ['no', 'の'],
    ['ne', 'ね'],
    ['nu', 'ぬ'],
    ['ni', 'に'],
    ['na', 'な'],
    ['ho', 'ほ'],
    ['he', 'へ'],
    ['fu', 'ふ'],
    ['hi', 'ひ'],
    ['ha', 'は'],
    ['mo', 'も'],
    ['me', 'め'],
    ['mu', 'む'],
    ['mi', 'み'],
    ['ma', 'ま'],
    ['yo', 'よ'],
    ['yu', 'ゆ'],
    ['ya', 'や'],
    ['ro', 'ろ'],
    ['re', 'れ'],
    ['ru', 'る'],
    ['ri', 'り'],
    ['ra', 'ら'],
    ['n', 'ん'],
    //['wi', 'ゐ'],
    //['we', 'ゑ'],
    ['wo', 'を'],
    ['wa', 'わ'],
];

module.exports = {
    name: "chat:hiragana",
    async init(MS, moduleName, filename) {
        MS.moduleDecl.chat.commands.hiragana = async function (location, data) {
            let text = data.stext.map(x => x.toLowerCase());

            if (text.length === 1) {
                await MS.run("chat-reply", location, {
                    type: "text",
                    text: `This is a command to convert to romaji from hiragana, and to hiragana from romaji. Does not support small characters, nor does it support the special つ (tsu) consonant expansion.\n${data.stext[0]} to [romaji text]\n${data.stext[0]} from [hiragana]`
                });
                return;
            } else if (text.length === 2) {
                await MS.run("chat-reply", location, {
                    type: "text",
                    text: "You used the command incorrectly. Use the command without any arguments to see the help."
                });
                return;
            }

            let input = text.slice(2).join(' ');
            let output = [];
            let symIndex;
            if (text[1] === "to") {
                symIndex = 0;
            } else if (text[1] === "from") {
                symIndex = 1;
            } else {
                await MS.run("chat-reply", location, {
                    type: "text",
                    text: "You used the command incorrectly. First argument (after command) must be 'to' or 'from'"
                });
            }

            for (let i = 0; i < input.length;) {
                // YOu can loop over the sounds they make and see if it matches, 
                let foundChar = false;
                for (let j = 0; j < characters.length; j++) {
                    let broke = false;
                    let index;
                    for (index = 0; index < characters[j][symIndex].length; index++) {
                        if (input[i+index] !== characters[j][symIndex][index]) {
                            broke = true;
                            break;
                        }
                    }

                    if (!broke) {
                        output.push(characters[j][Number(!symIndex)]);
                        i += characters[j][symIndex].length;

                        foundChar = true;
                        break;
                    }
                }

                if (!foundChar) {
                    output.push('?');
                    i++;
                }
            }

            await MS.run("chat-reply", location, {
                type: "text",
                text: "Output: " + output.join("")
            });
        };
    }
}