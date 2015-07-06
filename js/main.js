
function makeSong(note){

	return "X:1\n"+
	"V: 1 clef=bass\n"+
	"M:4/4\n"+
	"L:4/4\n"+
	"K:C,\n"+
	"|" + note + "|\n";

}

function renderSong(note){
	ABCJS.renderAbc('sheetOutput', makeSong(note))
}

var baseNote = teoria.note('C3')

var chromatics = [

	teoria.note('c2').scale('chromatic').notes(),
	teoria.note('c3').scale('chromatic').notes()

]

chromatics = chromatics.reduce(function(prev, curr, index, arr){
	return prev.concat(curr)
}, [])

renderSong("A,,")

var remaining = []

function plotRandomNote(){
	var teoriaNote = randomNote()

	makeAbcNote(teoriaNote)
}

function randomNote(){

	if(remaining.length == 0)
		remaining = chromatics.slice()

	var index = parseInt(Math.random() * remaining.length)	
	
	var note = remaining[index]

	remaining.splice(index, 1)

	return note
}

function makeAbcNote(teoriaNote){
	var noteName = teoriaNote.name()
	var octave = teoriaNote.octave()
	var accidental = teoriaNote.accidental()
	var abcAccidental = "";

	if(accidental == "b")
		abcAccidental = "_"
	else if(accidental == "#")
		abcAccidental = "^"

	var abcNote = abcAccidental + noteName

	abcNote += ",,,,,";

	for(var i = 0; i < octave; i++){
		if(abcNote.slice(-1) == ",")
			abcNote = abcNote.substring(0, abcNote.length - 1)
		else
			abcNote += ","
	}

	renderSong(abcNote)
	return abcNote

}

function convertNote(scientificNote){//converts a note with format xn. (a4b, for instance) and turns it into the corresponding, ABC readable note string

	var noteName = scientificNote.replace(/[0-9]/g,"")

	var octave = parseInt(scientificNote.substring(scientificNote.indexOf(noteName) + noteName.length))

	var note = noteName.replace(/(.).*/,"$1")

	var accidental = noteName.substring(noteName.indexOf(note) + note.length)

	var abcAccidental = ""

	console.log(noteName, octave, note, accidental)

	if(accidental == "b")
		abcAccidental = "_"
	else if(accidental == "#")
		abcAccidental = "^"

	var abcNote = abcAccidental + note

	abcNote += ",,,,,";

	for(var i = 0; i < octave; i++){
		if(abcNote.slice(-1) == ",")
			abcNote = abcNote.substring(0, abcNote.length - 1)
		else
			abcNote += ","
	}

	// startNote = startNote.replace(/',/g, "")//remove redundancies
	// startNote = startNote.replace(//)
	renderSong(abcNote)
	return abcNote
}