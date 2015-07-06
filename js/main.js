var baseNote = teoria.note('C3')

var chromatics = [
	teoria.note('e2').scale('chromatic').notes(),
	teoria.note('c3').scale('chromatic').notes(),
	teoria.note('g#3').scale('chromatic').notes(),
]



var pitchMap = {}

var maxFret = 20;

var strings = ["E", "A", "D", "G"]
var remaining = []
var lastNoteString = ""

var noteTime = 5000
var resultTime = 4000

hideResults()

chromatics = chromatics.reduce(function(prev, curr, index, arr){
	return prev.concat(curr)
}, [])

chromatics = chromatics.reduce(function(prev, curr, index, arr){
	var unique = prev.every(function(el){
		return el.toString() != curr.toString()
	})
	if(unique)
		prev.push(curr)
	return prev
}, [])

chromatics.forEach(function(e, i){

	var stringFrets = makeStringFrets(i)

	pitchMap[e.toString()] = stringFrets

})

startGame()

function makeNote(note){

	return "X:1\n"+
	"V: 1 clef=bass\n"+
	"M:4/4\n"+
	"L:4/4\n"+
	"K:C,\n"+
	"|" + note + "|\n";

}

function renderNote(note){
	ABCJS.renderAbc('sheetOutput', makeNote(note))
}


function plotRandomNote(){
	var teoriaNote = randomNote()

	makeAbcNote(teoriaNote)
}

function showNoteInfo(teoriaNote){
	$('infoOutput').style.display = "none"
	$('note').textContent = teoriaNote.name().toUpperCase()
	$('octave').textContent = parseInt(teoriaNote.octave())
	$('accidental').innerHTML = teoriaNote.accidental()

	$('tab').innerHTML = generateTab(teoriaNote.toString())

}

function randomNote(pop){

	if(pop === undefined)
		pop = true

	if(remaining.length == 0)
		remaining = chromatics.slice()

	var index;
	do{
		index = parseInt(Math.random() * remaining.length)
	} while(remaining[index].toString() == lastNoteString)
	
	var note = remaining[index]

	lastNoteString = note.toString()

	if(pop)
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

	renderNote(abcNote)
	return abcNote

}

function convertNote(scientificNote, render){//converts a note with format xn. (a4b, for instance) and turns it into the corresponding, ABC readable note string

	if(render === undefined)
		render = true

	var noteName = scientificNote.replace(/[0-9]/g,"")

	var octave = parseInt(scientificNote.substring(scientificNote.indexOf(noteName) + noteName.length))

	var note = noteName.replace(/(.).*/,"$1")

	var accidental = noteName.substring(noteName.indexOf(note) + note.length)

	var abcAccidental = ""

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
	if(render)
		renderNote(abcNote)

	return abcNote
}

function $(id){
	return document.getElementById(id)
}


function makeStringFrets(eFret){//generates a list of similar frets based on the fret of a note on the e string

	var ret = {}

	strings.forEach(function(e, i){
		var fret = eFret - 5 * i
		if(fret < 0 || fret > maxFret)
			return
		ret[e] = fret
	})

	return ret
}


function generateTab(teoriaPitch){
	var length = 4
	
	var noteStrings = pitchMap[teoriaPitch]

	var tabLength = strings.length

	var output = ""

	for(var i = 0; i < strings.length; i++){
		var string = strings[i]
		var val = "-"
		if(noteStrings[string] !== undefined){
			val += noteStrings[string]
		}

		while(val.length < length)
			val += "-"

		output = string + " " + val + "\n" + output

	}

	return output.replace(/-/g, "&#8213;").replace(/\n/g, "<br>")

}


function hideResults(){
	$('infoOutput').style.display = "none"
}

function showResults(teoriaNote){
	if(teoriaNote)
		showNoteInfo(teoriaNote)
	$('infoOutput').style.display = ""
}


function startGame(){
	gameStep()
	return  setInterval(function(){
		gameStep()
	}, noteTime + resultTime)
}

function gameStep(){
	hideResults()

	var note = randomNote()

	convertNote(note.toString())

	setTimeout(function(){
		showResults(note)
	}, noteTime)
}