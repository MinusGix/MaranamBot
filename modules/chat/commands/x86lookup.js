/* code to collect instructions from felixcloutlier's site
function collect (children, note="") {
	let instr = [];
	// Start at 1 to skip the header
	for (let i = 1; i < children.length; i++) {
		if (children[i].children.length !== 2) {
			console.log("Strange child element found: ", i, children[i], "did not have two subelements");
			continue;
        }

		let name = children[i].children[0].children[0].innerText;
		let url = children[i].children[0].children[0].href;
		let text = children[i].children[1].innerText;

		if (!name || !url || !text) {
			console.log("There was an issue with one of the children:", i, name, url, text);
        }

		instr.push({
			name: name,
			url: url,
			text: text
        });

        if (note !== "") {
            instr[instr.length-1].note = note;
        }

		if (instr[instr.length-1].name.includes("c")) {
			console.log("Take note of: ", instr[instr.length-1]);
        }
    }

	return instr;
}

var data = [];
var tables = document.getElementsByTagName("table");
data.push(...collect(tables[0].children[0].children));
data.push(...collect(tables[1].children[0].children));
data.push(...collect(tables[2].children[0].children));
data.push(...collect(tables[3].children[0].children));
data.push(...collect(tables[4].children[0].children));

document.write(JSON.stringify(data));

*/

function addExtraInstructions (data) {
    // CMOVcc
    // FCMOVcc
    // Jcc
    // LOOPcc
    // SETcc
    let cmov = findInstruction(data, "cmovcc");
    let fcmov = findInstruction(data, "fcmovcc");
    let j = findInstruction(data, "jcc");
    let loop = findInstruction(data, "loopcc");
    let set = findInstruction(data, "setcc");

    let cmovnote = cmov.note || "";
    let fcmovnote = fcmov.note || "";
    let jnote = j.note || "";
    let loopnote = loop.note || "";
    let setnote = set.note || "";

    // these genned from with slight modifications
    /*
    var ch = document.getElementsByTagName('table')[0].children[0].children;
var out = [];
var names = [];
for (let i = 1; i < ch.length; i++) {
	var name = ch[i].children[1].innerText.split(' ')[0];
	if (names.includes(name)) continue;
	names.push(name);

	out.push({
		name: name,
		text: ch[i].children[5].innerText
    });
}
document.write(JSON.stringify(out));
*/

    let cmovdata = [{"name":"CMOVA","text":"Move if above (CF=0 and ZF=0)."},{"name":"CMOVAE","text":"Move if above or equal (CF=0)."},{"name":"CMOVB","text":"Move if below (CF=1)."},{"name":"CMOVBE","text":"Move if below or equal (CF=1 or ZF=1)."},{"name":"CMOVC","text":"Move if carry (CF=1)."},{"name":"CMOVE","text":"Move if equal (ZF=1)."},{"name":"CMOVG","text":"Move if greater (ZF=0 and SF=OF)."},{"name":"CMOVGE","text":"Move if greater or equal (SF=OF)."},{"name":"CMOVL","text":"Move if less (SF≠ OF)."},{"name":"CMOVLE","text":"Move if less or equal (ZF=1 or SF≠ OF)."},{"name":"CMOVNA","text":"Move if not above (CF=1 or ZF=1)."},{"name":"CMOVNAE","text":"Move if not above or equal (CF=1)."},{"name":"CMOVNB","text":"Move if not below (CF=0)."},{"name":"CMOVNBE","text":"Move if not below or equal (CF=0 and ZF=0)."},{"name":"CMOVNC","text":"Move if not carry (CF=0)."},{"name":"CMOVNE","text":"Move if not equal (ZF=0)."},{"name":"CMOVNG","text":"Move if not greater (ZF=1 or SF≠ OF)."},{"name":"CMOVNGE","text":"Move if not greater or equal (SF≠ OF)."},{"name":"CMOVNL","text":"Move if not less (SF=OF)."},{"name":"CMOVNLE","text":"Move if not less or equal (ZF=0 and SF=OF)."},{"name":"CMOVNO","text":"Move if not overflow (OF=0)."},{"name":"CMOVNP","text":"Move if not parity (PF=0)."},{"name":"CMOVNS","text":"Move if not sign (SF=0)."},{"name":"CMOVNZ","text":"Move if not zero (ZF=0)."},{"name":"CMOVO","text":"Move if overflow (OF=1)."},{"name":"CMOVP","text":"Move if parity (PF=1)."},{"name":"CMOVPE","text":"Move if parity even (PF=1)."},{"name":"CMOVPO","text":"Move if parity odd (PF=0)."},{"name":"CMOVS","text":"Move if sign (SF=1)."},{"name":"CMOVZ","text":"Move if zero (ZF=1)."}];
    cmovdata.forEach(x => {
        x.note = cmovnote;
        x.text += " " + cmov.text;
        x.url = cmov.url;
    });
    data.unshift(...cmovdata);

    let fcmovdata = [{"name":"FCMOVB","text":"Move if below (CF=1)."},{"name":"FCMOVE","text":"Move if equal (ZF=1)."},{"name":"FCMOVBE","text":"Move if below or equal (CF=1 or ZF=1)."},{"name":"FCMOVU","text":"Move if unordered (PF=1)."},{"name":"FCMOVNB","text":"Move if not below (CF=0)."},{"name":"FCMOVNE","text":"Move if not equal (ZF=0)."},{"name":"FCMOVNBE","text":"Move if not below or equal (CF=0 and ZF=0)."},{"name":"FCMOVNU","text":"Move if not unordered (PF=0)."}];
    fcmovdata.forEach(x => {
        x.note = fcmovnote;
        x.text += " " + fcmov.text;
        x.url = fcmov.url;
    });
    data.unshift(...fcmovdata);

    let jdata = [{"name":"JA","text":"Jump short if above (CF=0 and ZF=0)."},{"name":"JAE","text":"Jump short if above or equal (CF=0)."},{"name":"JB","text":"Jump short if below (CF=1)."},{"name":"JBE","text":"Jump short if below or equal (CF=1 or ZF=1)."},{"name":"JC","text":"Jump short if carry (CF=1)."},{"name":"JCXZ","text":"Jump short if CX register is 0."},{"name":"JECXZ","text":"Jump short if ECX register is 0."},{"name":"JRCXZ","text":"Jump short if RCX register is 0."},{"name":"JE","text":"Jump short if equal (ZF=1)."},{"name":"JG","text":"Jump short if greater (ZF=0 and SF=OF)."},{"name":"JGE","text":"Jump short if greater or equal (SF=OF)."},{"name":"JL","text":"Jump short if less (SF≠ OF)."},{"name":"JLE","text":"Jump short if less or equal (ZF=1 or SF≠ OF)."},{"name":"JNA","text":"Jump short if not above (CF=1 or ZF=1)."},{"name":"JNAE","text":"Jump short if not above or equal (CF=1)."},{"name":"JNB","text":"Jump short if not below (CF=0)."},{"name":"JNBE","text":"Jump short if not below or equal (CF=0 and ZF=0)."},{"name":"JNC","text":"Jump short if not carry (CF=0)."},{"name":"JNE","text":"Jump short if not equal (ZF=0)."},{"name":"JNG","text":"Jump short if not greater (ZF=1 or SF≠ OF)."},{"name":"JNGE","text":"Jump short if not greater or equal (SF≠ OF)."},{"name":"JNL","text":"Jump short if not less (SF=OF)."},{"name":"JNLE","text":"Jump short if not less or equal (ZF=0 and SF=OF)."},{"name":"JNO","text":"Jump short if not overflow (OF=0)."},{"name":"JNP","text":"Jump short if not parity (PF=0)."},{"name":"JNS","text":"Jump short if not sign (SF=0)."},{"name":"JNZ","text":"Jump short if not zero (ZF=0)."},{"name":"JO","text":"Jump short if overflow (OF=1)."},{"name":"JP","text":"Jump short if parity (PF=1)."},{"name":"JPE","text":"Jump short if parity even (PF=1)."},{"name":"JPO","text":"Jump short if parity odd (PF=0)."},{"name":"JS","text":"Jump short if sign (SF=1)."},{"name":"JZ","text":"Jump short if zero (ZF = 1)."}];
    jdata.forEach(x => {
        x.note = jnote;
        x.text += " " + j.text;
        x.url = j.url;
    });
    data.unshift(...jdata);

    let loopdata = [{"name":"LOOP","text":"Decrement count; jump short if count ≠ 0."},{"name":"LOOPE","text":"Decrement count; jump short if count ≠ 0 and ZF = 1."},{"name":"LOOPNE","text":"Decrement count; jump short if count ≠ 0 and ZF = 0."}];
    loopdata.forEach(x => {
        x.note = loopnote;
        x.text += " " + loop.text;
        x.url = loop.url;
    });
    data.unshift(...loopdata);

    let setdata = [{"name":"SETA","text":"Set byte if above (CF=0 and ZF=0)."},{"name":"SETAE","text":"Set byte if above or equal (CF=0)."},{"name":"SETB","text":"Set byte if below (CF=1)."},{"name":"SETBE","text":"Set byte if below or equal (CF=1 or ZF=1)."},{"name":"SETC","text":"Set byte if carry (CF=1)."},{"name":"SETE","text":"Set byte if equal (ZF=1)."},{"name":"SETG","text":"Set byte if greater (ZF=0 and SF=OF)."},{"name":"SETGE","text":"Set byte if greater or equal (SF=OF)."},{"name":"SETL","text":"Set byte if less (SF≠ OF)."},{"name":"SETLE","text":"Set byte if less or equal (ZF=1 or SF≠ OF)."},{"name":"SETNA","text":"Set byte if not above (CF=1 or ZF=1)."},{"name":"SETNAE","text":"Set byte if not above or equal (CF=1)."},{"name":"SETNB","text":"Set byte if not below (CF=0)."},{"name":"SETNBE","text":"Set byte if not below or equal (CF=0 and ZF=0)."},{"name":"SETNC","text":"Set byte if not carry (CF=0)."},{"name":"SETNE","text":"Set byte if not equal (ZF=0)."},{"name":"SETNG","text":"Set byte if not greater (ZF=1 or SF≠ OF)"},{"name":"SETNGE","text":"Set byte if not greater or equal (SF≠ OF)."},{"name":"SETNL","text":"Set byte if not less (SF=OF)."},{"name":"SETNLE","text":"Set byte if not less or equal (ZF=0 and SF=OF)."},{"name":"SETNO","text":"Set byte if not overflow (OF=0)."},{"name":"SETNP","text":"Set byte if not parity (PF=0)."},{"name":"SETNS","text":"Set byte if not sign (SF=0)."},{"name":"SETNZ","text":"Set byte if not zero (ZF=0)."},{"name":"SETO","text":"Set byte if overflow (OF=1)"},{"name":"SETP","text":"Set byte if parity (PF=1)."},{"name":"SETPE","text":"Set byte if parity even (PF=1)."},{"name":"SETPO","text":"Set byte if parity odd (PF=0)."},{"name":"SETS","text":"Set byte if sign (SF=1)."},{"name":"SETZ","text":"Set byte if zero (ZF=1)."}];
    setdata.forEach(x => {
        x.note = setnote;
        x.text += " " + set.text;
        x.url = set.url;
    });
    data.unshift(...setdata);
}

function findInstruction (data, oinstr) {
    let instr = oinstr.toUpperCase();
    if (
        (instr === "CMOVCC" || instr === "FCMOVCC" || instr === "JCC" || instr === "LOOPCC" || instr === "SETCC") &&
        oinstr[oinstr.length-1] === 'c' && oinstr[oinstr.length-2] === 'c'
    ) {
        instr = instr.slice(0, instr.length-2) + 'cc';
    }

    for (let i = 0; i < data.length; i++) {
        if (data[i].name === instr) {
            return data[i];
        }
    }
    return null;
}


module.exports = {
    name: "chat:x86",
    async init (MS, moduleName, filename) {
        let x86data = null;
        let hadError = false;

        let startTime = Date.now();
        require('fs').readFile(__dirname + "/x86.json", (err, data) => {
            if (err) {
                hadError = true;
                MS.log.error("[chat] [x86lookup command] had an error loading it's data:", err);
                delete MS.moduleDecl.chat.commands.x86;

                return;
            }
            x86data = JSON.parse(data.toString());
            addExtraInstructions(x86data);
            MS.log.info("[chat] [x86lookup] Data loaded. Took: " + (Date.now() - startTime) + "ms");
        });

        MS.moduleDecl.chat.commands.x86 = async function (location, data) {
            if (data.stext.length === 1 || data.stext.length > 2) {
                await MS.run("chat-reply", location, {
                    type: "text",
                    text: "This command outputs a small description of an x86 command and a link to a page describing it."
                });
                return;
            }

            if (x86data === null) {
                if (hadError) {
                    await MS.run("chat-reply", location, {
                        type: "text",
                        text: "Bot had issue loading x86 info from file at startup. Command is disabled."
                    });
                } else {
                    await MS.run("chat-reply", location, {
                        type: "text",
                        text: "x86 data hasn't yet loaded."
                    });
                }
                return;
            }

            let instr = data.stext[1];

            let foundInstr = findInstruction(x86data, instr);

            if (foundInstr) {
                await MS.run("chat-reply", location, {
                    type: "text",
                    text: foundInstr.name + "\n" + foundInstr.url + "\n" + foundInstr.text + (foundInstr.note ? "\n"+foundInstr.note:"")
                });
            } else {
                await MS.run("chat-reply", location, {
                    type: "text",
                    text: "I couldn't find that instruction :("
                });
            }
        }
    }
}