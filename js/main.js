var chromatics, pitchMap, maxFret, strings, remaining, lastNoteString, noteTime, tabTime, lastInterval, nextTimeout;

init()

function makeChromatic(octave){
	var notes = []
	for(var i = "a".charCodeAt(0); i <= "g".charCodeAt(0); i++){

		var letter = String.fromCharCode(i)

		if("abe".indexOf(letter) > -1)//flats
			notes.push(teoria.note(letter + 'b' + octave))

		notes.push(teoria.note(letter + octave))

		if("cf".indexOf(letter) > -1)
			notes.push(teoria.note(letter + '#' + octave))
	}

	return notes
}

function init(){

	hideResults()


	chromatics = [
		makeChromatic(2).slice(8),
		makeChromatic(3),
		makeChromatic(4)
	]



	pitchMap = {}

	maxFret = 20;

	strings = ["E", "A", "D", "G"]
	remaining = []
	lastNoteString = ""

	chromatics = chromatics.reduce(function(prev, curr, index, arr){
		return prev.concat(curr)
	}, [])

	chromatics = chromatics.reduce(function(prev, curr, index, arr){
		var unique = prev.every(function(el){
			return el.chroma() != curr.toString()
		})
		if(unique)
			prev.push(curr)
		return prev
	}, [])

	chromatics.forEach(function(e, i){

		var stringFrets = makeStringFrets(i)

		pitchMap[e.toString()] = stringFrets

	})

	readSettingsAndRestart()

	$('update').onclick = function(e){
		e.preventDefault()
		readSettingsAndRestart()
	}


}

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
	hideResults()
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

	if("ab".indexOf(noteName) != -1)
		abcNote += ","

	for(var i = 0; i < octave; i++){
		if(abcNote.slice(-1) == ",")
			abcNote = abcNote.substring(0, abcNote.length - 1)
		else
			// abcNote += ","
			abcNote += "'"
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
	$('infoOutput').style.visibility = "hidden"
}

function showResults(teoriaNote){
	if(teoriaNote)
		showNoteInfo(teoriaNote)
	$('infoOutput').style.visibility = ""
}


function startGame(){
	gameStep()
	return  setInterval(function(){
		gameStep()
	}, noteTime + tabTime)
}

function gameStep(){
	hideResults()

	var note = randomNote()

	convertNote(note.toString())

	nextTimeout = setTimeout(function(){
		showResults(note)
	}, noteTime)
}

function readSettingsAndRestart(){
	tabTime = parseInt($('tabTime').value) || 5000
	noteTime = parseInt($('noteTime').value) || 4000
	clearInterval(lastInterval)
	clearTimeout(nextTimeout)
	lastInterval = startGame()

}