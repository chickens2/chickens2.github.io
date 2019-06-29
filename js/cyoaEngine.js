datastore={}
tempdata={}
tagdata={}
tagdatareverse={}
declareTagsFlag=false
async function loadBrowser(){
        try{
            var projectName=getQueryVariable('p')
            if(projectName){
                datastore=JSON.parse(window.localStorage['CYOA_'+projectName]);
            }
            else{
                var pasteName=getQueryVariable('paste')
                if(pasteName){
                    var pasteDecoded=decodeURIComponent(pasteName)
                    console.log('pastename is ',pasteName,pasteDecoded)
                    await $.getJSON(pasteDecoded, function(result){
                      console.log('got result from site',result)
                      datastore=result
                      var editlink=document.getElementById('editlink')
                      editlink.href=window.location.host+'/editor?paste='+pasteName
                      editlink.style='display:inline-block'
                    });
                }
                else{
                    console.log('could not find url variables describing cyoa contents, looking for server file')
                    await $.getJSON("../CYOA.json", function(result) {
                        console.log('got result from file'); 
                        datastore=result
                    })
                    .fail(function(){
                        console.log('request failed, cant find any CYOA to display')
                    })
                }
            }
            if(datastore && typeof datastore=='object'){
                    load(datastore)
                }
        }
        catch(err){
            console.log('load error, try clearing browser cache ',window.localStorage.CYOA,err)
        }
    }
function load(datastore){
    for(let i=0;i<datastore.images.length;i++){
        addImage2(i+1,datastore.images[i])
    }
    for(let i=0;i<datastore.selections.length;i++){
        selections=datastore.selections
        var firstimgposition=$('#outimg1').position()
        
        var dif=14.5
        if(selections[i]){
            console.log('???',firstimgposition,selections[i].x+firstimgposition.left)
            addSelectBox(i,(selections[i].x+firstimgposition.left),(selections[i].y+firstimgposition.top),selections[i].width,selections[i].height)
        }
    }
    
}
function addImage2(i,imagePath){
    $('#mainDisplay').append('<img class="outimg" id="outimg'+i+'">')
    var outimg= document.getElementById("outimg"+i)
    outimg.src = imagePath
}
function addSelectBox(i,x,y,w,h){
    console.log('addselectbox',i,x,y,w,h)
    $("#mainDisplay").append("<div id=selectionBox"+i+" class='selectionBox' onclick='selectionClicked(this)'></div>")
    var box=document.getElementById('selectionBox'+i)
    box.style.top = y+'px'
    box.style.left=x+'px'
    box.style.width=w+'px'
    box.style.height=h+'px'
    return box
}
function selectionClicked(selection){
    var index=parseInt(toN(selection.id))
    console.log('selectionclicked',selection)
    if(selection.classList.contains('selected')){
        selection.classList.remove('selected')
        tempdata.selected[index]=false
        runAllSelections(selection,index,false)
    }
    else{
        runAllSelections(selection,index,true)
    }
}
function runSelection(index){
    currentSelectionIndex=index
    //console.log('???rs ',index)
    var result=false
    try{
        var codetorun='(function() {' + datastore.selectionCode[index+1] + '})()'
        //console.log('running code: ',codetorun)
        result=window.eval(codetorun)
        //console.log('finished running eval code',result)
    }
    catch(err){
        alert("error with code for selection #"+index+": \n"+err.message+"\n\n"+err.stack);
    }
    //console.log('result of runselection eval for ',index,result,datastore.selectionCode[index] )
    return result
}
function selectionIndexesSortedByExecutionOrder(){
    var sortfn=function(a,b){
        return datastore.selectionExecutionOrder[a]-datastore.selectionExecutionOrder[b]
    }
    var eoIndexes=[]
    for(let i=0;i<datastore.selectionExecutionOrder.length;i++){
        eoIndexes.push(i)
    }
    eoIndexes.sort(sortfn)
    eoIndexes.unshift(-1)//the first should always be the starting selection
    return eoIndexes
 }
function runAllSelectionsInitial(){
    declareTagsFlag=true
    CYOA={}
    //for(let i=-1;i<datastore.selectionCode.length;i++){
    var eoIndexes=selectionIndexesSortedByExecutionOrder()
    for(let i=0;i<eoIndexes.length;i++){
        if(eoIndexes[i]==-1 || datastore.selections[eoIndexes[i]]){
            runSelection(eoIndexes[i])
        }
    }
    CYOA={}
    runSelection(-1)
    declareTagsFlag=false
    updateVariableDisplay()
}
function runAllSelections(currentSelection,index,csSelected){
    console.log('running all selections')
    CYOA={} //special global object for user to store variables in
    //resetSelected()
    var eoIndexes=selectionIndexesSortedByExecutionOrder()
    eoIndexes.shift()
    runSelection(-1)
    //for(let i=0;i<datastore.selectionCode.length;i++){
    for(let i=0;i<eoIndexes.length;i++){
        if(tempdata.selected[eoIndexes[i]]){
            //run all the code for previous selected options. If one of them has become unable to be selected, automatically deselect it.
            //console.log('running selection beforehand ',i)
            if(!runSelection(eoIndexes[i])){
                var box=document.getElementById('selectionBox'+eoIndexes[i])
                box.classList.remove("selected")
                tempdata.selected[eoIndexes[i]]=false
            }
        }
        //special case for the selection the user just clicked
        if(eoIndexes[i]==index){
            //if most recent selection was just selected (csSelected) (whether successfully or not will be determined by runSelection), include it in the calculation, otherwise it was just deselected, so do nothing.
            if(csSelected){
                tempdata.selected[index]=true
                console.log('checking latest selection')
                if(runSelection(index)){
                    currentSelection.classList.add("selected")
                    updateVariableDisplay()
                }
                else{
                    currentSelection.classList.add("selectfail")
                    setTimeout(function(){currentSelection.classList.remove("selectfail")},200)
                    tempdata.selected[index]=false
                    return
                }
            }
        }
    }
    //display new state to player
    updateVariableDisplay()


}
function updateVariableDisplay(){
    var text=""
    for(let i=0;i<UIVars.length;i++){
        text+=UIVars[i]+": "+CYOA[UIVars[i]]
        text+='<br>'
    }
    console.log('should be updating var display')
    document.getElementById('scorebarSpan').innerHTML=text
}
function declareTags(){
    if(declareTagsFlag){
        tagdata[currentSelectionIndex]=arguments
        for(let i=0;i<arguments.length;i++){
            var indexList=tagdatareverse[arguments[i]]
            if(!indexList){
                indexList=new Set()
                tagdatareverse[arguments[i]]=indexList
            }
            indexList.add(currentSelectionIndex)
        }
    }
}
function selectionHasAnyTags(){
}
function selectionHasAllTags(){
    //console.log('checking selectionhasalltags',tagdata[currentSelectionIndex],arguments)
    for(let i=0;i<arguments.length;i++){
        if(Object.values(tagdata[currentSelectionIndex]).indexOf(arguments[i])==-1)
        {
            //console.log('couldnt find tag ',arguments[i])
            return false
        }
    }
    //console.log('found all tags')
    return true
}
function selectionHasTag(selection){
    return selectionHasAllTags.apply(null,arguments)
}
function getSelectedTagCount(tagName){
    var indexList=[]
    if(tagName in tagdatareverse){
        indexList=Array.from(tagdatareverse[tagName])
    }
    var stc=0
    if(indexList){
        for(let i=0;i<indexList.length;i++){
            if(tempdata.selected[indexList[i]]){
                stc+=1
            }
        }
    }
    //console.log('get selected tag count',tagName,stc,indexList)
    return stc
}
function resetSelected(){
    tempdata.selected=[]
    for(let i=0;i<datastore.selections.length;i++){
        tempdata.selected.push(false)
    }
}
async function init(){
    await loadBrowser()
    resetSelected()
    runAllSelectionsInitial()
    //runAllSelections()
}
function toN(str){
    return str.replace( /^\D+/g, '')
}
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}