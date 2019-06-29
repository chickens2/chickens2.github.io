codeTemplates={
'Always_Selectable':`//makes this option selectable, no matter what
return true`,
'Points':`//Standard point cost selection.
//change to the point cost of this option (change '-' to '+' to add points instead)
CYOA.points-= 5 
//Must return whether the option is selectable. For a standard points selection, it should always be selectable.
return true
`,
'Choose_N':`//Only allows the user to select a limited number of options with a given tag.
//Sets the tags for this selection (in quotes, separated with commas). This is a special function that is only called once, before anything is selected.
declareTags('exampleTag','anotherTag')
//If there are one or more options with the given tag, this option will not be selectable (to make a larger amount selectable, increase the number).
return getSelectedTagCount('exampleTag') <= 1
`,
'Choose_N/Points':`//For options that are both limited in number and affect points
declareTags('exampleTag')
CYOA.points-= 5 
return getSelectedTagCount('exampleTag') <= 1
`,
'Prerequisite':`//For options that require another option to first be selected
return getSelectedTagCount('exampleTag')>0
`,
'Prerequisite/Points':`//For options that require another option to first be selected
CYOA.points-= 5 
return getSelectedTagCount('exampleTag')>0
`,
'Welcome_Text':`/*
Welcome to CYOA Interactivator! 

This is the initialization code, which runs before all other calculations. This is where you set up initial values and variables, and determine what information will be shown to the user.

Above this window is a 'Template' dropdown, which contains default code for various common CYOA selections. It is recommended that you select the 'Initialize' template now.
*/
`,
'Initialize':`//Set custom CSS
var styles = \`
.selected {
  box-shadow: 0 0 6pt 5pt green;
}
\`

var styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet)

//Set initial variables.
//set the 'points' variable to start at 100
CYOA['points']=100
CYOA['energy']=50
//Pick which variables are displayed to the user (if points was not included here it would still factor into game logic, just not be displayed)
UIVars=['points','energy']
`
}