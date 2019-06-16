datastore=null
function init(){
    console.log('editall test')
        myCodeMirror = CodeMirror(document.getElementById('mainDisplay'), {
            theme:'material',
            mode:'javascript',
            matchBrackets:true,
            lineNumbers: true,
            lineWrapping: true
        });
        myCodeMirror.on('change',function(instance,changeObj){
            //console.log('codemirror change ',changeObj)
            cminstance=instance
            if(changeObj.origin!='setValue'){
                //saveCurrentCode()
            }
        });
        jsonstr=window.localStorage['CYOA_'+window.localStorage.currentProject]
        datastore=JSON.parse(jsonstr)
        myCodeMirror.setValue(jsonToCode())
        //myCodeMirror.setValue(JSON.stringify(JSON.parse(window.localStorage.CYOA),null,2))
}
function saveCode(){
    var re=/\n\*\*\*\*\*\d*\*\*\*\*\*\n/g
    var allcode=myCodeMirror.getValue()
    var codeparts=allcode.split(re)
    codeparts.shift()
    var indexes=[]
    do {
        m = re.exec(allcode);
        if (m) {
            indexes.push(parseInt(toN(m[0])))
        }
        else{
            console.log('couldnt find ',m)
        }
    } while (m);
    var numWithCode=0
    //reload datastore in case changes made elsewhere since page was loaded
    jsonstr=window.localStorage['CYOA_'+window.localStorage.currentProject]
    datastore=JSON.parse(jsonstr)
    for(let i=0;i<datastore.selectionCode.length;i++){
        if(datastore.selectionCode[i]){
            numWithCode++
        }
    }
    console.log('compare lengths',codeparts.length,numWithCode)
    if(codeparts.length!=numWithCode)
    {
        var dontcancel=confirm("The number of selections in this code does not match the number currently recorded ("+codeparts.length+","+numWithCode+"). Unpublished work may be lost. Are you sure you want to proceed? Otherwise, cancel and refresh the page.")
        console.log('dontcancelresult',dontcancel)
        if(!dontcancel){
            return false
        }
    }
    for(let i=0;i<codeparts.length;i++){
        //console.log(indexes[i],codeparts[i])
        datastore.selectionCode[indexes[i]]=codeparts[i]
    }
    saveBrowser()
}
function jsonToCode(){
    if(datastore.selectionCode){
        console.log('????')
        var codestr=`/*******************
This screen allows you to modify all selection code at once. Useful if you want to use find/replace or do editing in a separate text editor.
*******************/\n`
        for(let i=0;i<datastore.selectionCode.length;i++){
            if(datastore.selectionCode[i]){
                codestr+="\n*****"+(i)+"*****\n"
                codestr+=datastore.selectionCode[i]
            }
        }
        return codestr
    }
    else{
        return ""
    }
}
function saveBrowser(){
    window.localStorage['CYOA_'+window.localStorage.currentProject]=JSON.stringify(datastore);
}
function toN(str){
    return str.replace( /^\D+/g, '')
}