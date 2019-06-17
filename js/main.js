    //ICYOA
    datastore=null
    currentProject=null
    function saveBrowser(){
        //console.log('browser saved')
        //console.trace()
        //window.localStorage.CYOA=JSON.stringify(datastore);
        window.localStorage['CYOA_'+window.localStorage.currentProject]=JSON.stringify(datastore);
    }
    function loadBrowser(){
        try{
            //datastore=JSON.parse(window.localStorage.CYOA);
            loadProject(window.localStorage.currentProject)
            //window.localStorage.currentProject=
            var link=document.getElementById('testcyoalink')
            link.setAttribute('href','./engine.html?p='+window.localStorage.currentProject);
            if(typeof datastore=='object'){
                load(datastore)
            }
        }
        catch(err){
            console.log('load error, try clearing browser cache ',window.localStorage.CYOA,err)
        }
    }
    function getHighestExecutionOrder(){
        var highest=0
        for(let i=0;i<datastore.selectionExecutionOrder.length;i++){
            if(datastore.selectionExecutionOrder[i]>highest){
                highest=datastore.selectionExecutionOrder[i]
            }
        }
        return highest
    }
    function load(datastore){
        for(let i=0;i<datastore.images.length;i++){
            addImage2(i+1,document.getElementsByName('addimg'+(i+1))[0],datastore.images[i])
        }
        var firstimgposition=$('#outimg1').position()
        var heightDif=14.5
        console.log('original firstimgposition',firstimgposition)
        for(let i=0;i<datastore.selections.length;i++){
            selections=datastore.selections
            if(selections[i]){
                addSelectBox(i,selections[i].x+firstimgposition.left,selections[i].y+firstimgposition.top-heightDif,selections[i].width,selections[i].height)
            }
        }
        if(datastore.currentSelection==-1 || datastore.selections[datastore.currentSelection]){
            var selectedId='scorebar'
            if(datastore.currentSelection>=0){
                selectedId='selectionBox'+datastore.currentSelection
            }
            if(datastore.currentSelection!=-2){
                selectionClicked(document.getElementById(selectedId))
            }
        }

    }
    function saveBoxDimensions(i){
        if(datastore.selections[i]){
            var box=datastore.selections[i]
            var elem=document.getElementById('selectionBox'+i)
            var rect=elem.getBoundingClientRect();
            var position=$('#selectionBox'+i).position()
            var firstimgposition=$('#outimg1').position()
            //console.log('sbd ',i,position)
            box.x=position.left-firstimgposition.left
            box.y=position.top-firstimgposition.top
            box.width=rect.width
            box.height=rect.height
        }
        
    }
    function addSelection(){
        selections=datastore.selections
        scrollHeight=document.documentElement.scrollTop || document.body.scrollTop
        lastbox={'x':100,'y':scrollHeight+100,'height':200,'width':200}
        if(selections.length>0 && selections[selections.length-1]){
            lastbox=selections[selections.length-1]
        }
        var box=addSelectBox(selections.length,100,scrollHeight+100,lastbox.width,lastbox.height)
        // $("#editorSpace").append("<div id=selectionBox"+selections.length+" class='resize-drag'>test</div>")
        // box=document.getElementById('selectionBox'+selections.length)
        // scrollHeight=document.documentElement.scrollTop || document.body.scrollTop
        // box.style.top = (scrollHeight+100)+'px'
        // box.style.left='100px'
        // box.style.width='200px'
        // box.style.height='200px'
        
        //find which image it's in and relative position
        selections.push({'x':toN(box.style.left),'y':toN(box.style.top),'width':box.style.width,'height':box.style.height})
        //set selection order
        datastore.selectionExecutionOrder[selections.length-1]=Math.max(0,Math.floor(getHighestExecutionOrder()/100+1)*100);
        saveBrowser()
    }
    function addSelectBox(i,x,y,w,h){
        console.log('addselectbox',i,x,y,w,h)
        $("#editorSpace").append("<div id=selectionBox"+i+" class='resize-drag selectionBox' onclick='selectionClicked(this)'></div>")
        $('#selectionBox'+i).append("<img class='resize-drag2' src='img/drag.png' width=50px height=50px>")
        /*
        .close {
    float:right;
    display:inline-block;
    padding:2px 5px;
    background:#ccc;
}*/
        $('#selectionBox'+i).append("<a class='close' onclick='deleteSelection("+i+")'>")
        var box=document.getElementById('selectionBox'+i)
        box.style.top = y+'px'
        box.style.left=x+'px'
        box.style.width=w+'px'
        box.style.height=h+'px'
        return box
    }
    function deleteSelection(i){
        console.log('deleting selection',i)
        var del=true
        if(datastore.selectionCode[i+1]){
            del=confirm("Are you sure you want to delete this selection? All associated code will be lost.")
        }
        if(del){
            console.log('should delete ',i)
            datastore.selections[i]=null//.splice(i,1)
            saveBrowser()
            var element=document.getElementById('selectionBox'+i)
            element.parentNode.removeChild(element)
        }
    }
    function removeImage(i){
        datastore.images.splice(i,1)
        saveBrowser()
        //new ScrollSneak(location.hostname).sneak()
        location.reload(true);
    }

    function refreshUIVisibilities(){
        //ipfs=document.getElementsByClassName('imageinputform')
        $('#scorebar').each(function(index){$(this).hide()});
        $('.imageinputform').each(function(index){
            $(this).hide()
        });
        $('#options').each(function(index){$(this).hide()});
        for(let i=0;i<datastore.images.length+1;i++){
            $('.imageinputform:eq('+i+')').each(function(){
                $(this).show()
            });
        }
        if(datastore.images.length>0){
            $('#options').each(function(index){$(this).show()});
            $('#scorebar').each(function(index){$(this).show()});
        }
    }
    function addImage(i){
        i=i+1
        var testelem=document.getElementsByName('addimg'+i)[0]
        addImage2(i,testelem,testelem.value)
    }
    function addImage2(i,testelem,imagePath){
        testelem.value=imagePath
        var outimg= document.getElementById("outimg"+i)
        outimg.src = imagePath
/*         $('.imageinputform:eq('+i+')').each(function(){
                            console.log('????',i,$(this))
                            $(this).show()
                        }); */
        document.getElementsByName('addimg'+(i+1))[0].value=''
        console.log('putting image in datastore',datastore.images,i-1,outimg.src)
        datastore.images[i-1]=outimg.src
        saveBrowser()
        refreshUIVisibilities()
    }
    function saveCurrentCode(){
        datastore.selectionCode[datastore.currentSelection+1]=myCodeMirror.getValue()
        saveBrowser()
    }
    function init(){
        console.log('main init')
        
        //set position of codebar BEFORE codemirror is initialized, as semi workaround for wrong-position cursor bug in codemirror.
        //datastore=JSON.parse(window.localStorage.CYOA);
        if(window.localStorage.currentProject){
            loadProject(window.localStorage.currentProject)
        }
        if(datastore){
            document.getElementById('codebar').style.width=datastore.codebarWidth
        }
        //toggleCodebar(document.getElementById('codebar'))
            myCodeMirror = CodeMirror(document.getElementById('codebar'), {
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
                saveCurrentCode()
            }
        });
        
        //set modal copy codemirror
         myCodeMirrorModal = CodeMirror(document.getElementById('modalcodebox'), {
            theme:'material',
            mode:'javascript',
            lineWrapping: true
        });
        myCodeMirrorModal.setSize(300,200)
        console.log('what??')
        $('.imageinputform').each(function(index){
            //console.log('????',$(this))
            $(this).hide()
        });
        $('.imageinputform:first').each(function(){
            //console.log('???',$(this))
            $(this).show()
        });
        for(let i=1;i<=10;i++){
            var testelem=document.getElementsByName('addimg'+i)
        }
                interact('.resize-drag2')
          .draggable({
            onmove: window.dragMoveListener,
            modifiers: [
              interact.modifiers.restrict({
                endOnly: true,
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
              })
            ],
            inertia: true,
          })
          
          interact('.resize-drag')
          .resizable({
            // resize from all edges and corners
            edges: { left: true, right: true, bottom: true, top: true },

            modifiers: [
              // keep the edges inside the parent
              interact.modifiers.restrictEdges({
                endOnly: true,
              }),

              // minimum size
              interact.modifiers.restrictSize({
                min: { width: 100, height: 50 },
              }),
            ],

            inertia: true
          })
          .on('resizemove', function (event) {
            var target = event.target,
                x = (parseFloat(target.getAttribute('data-x')) || 0),
                y = (parseFloat(target.getAttribute('data-y')) || 0);

            // update the element's style
            target.style.width  = event.rect.width + 'px';
            target.style.height = event.rect.height + 'px';

            // translate when resizing from top or left edges
            x += event.deltaRect.left;
            y += event.deltaRect.top;

            target.style.webkitTransform = target.style.transform =
                'translate(' + x + 'px,' + y + 'px)';

            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
            //target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
            
            saveBoxDimensions(parseInt(toN(target.id)))//get the number in the id
            saveBrowser()
          });
          
          interact('.resize-drag3')
          .resizable({
            // resize from all edges and corners
            edges: { left: true, right: true, bottom: true, top: true },

            modifiers: [
              // keep the edges inside the parent
              interact.modifiers.restrictEdges({
                endOnly: true,
              }),

              // minimum size
              interact.modifiers.restrictSize({
                min: { width: 10, height: 50 },
              }),
            ],

            inertia: false
          })
          .on('resizemove', function (event) {
            var target = event.target,
                x = (parseFloat(target.getAttribute('data-x')) || 0),
                y = (parseFloat(target.getAttribute('data-y')) || 0);
            // update the element's style
            target.style.width  = event.rect.width + 'px';
            if(datastore){
                datastore.codebarWidth=event.rect.width
            }
            //setTimeout(myCodeMirror.refresh(),100)
          });
        var codeTemplateSelector=document.getElementById('templateSelector')
        var previous
        $('#templateSelector').on('focus',function(){
            previous=this.value
        }).change(function(){
            if(codeTemplateSelector.value=='-'){return}
            console.log('test change listener ',codeTemplateSelector.value,codeTemplates[codeTemplateSelector.value])
            var identical=false
            if(myCodeMirror.getValue()==""){
                identical=true
            }
            for(var key in codeTemplates){
                console.log('checking identical^'+codeTemplates[key]+'^'+myCodeMirror.getValue())
                if(codeTemplates[key]==myCodeMirror.getValue()){
                    identical=true
                    console.log('found identical')
                    break
                }
            }
            if(!identical){
                if(confirm("Custom code will be overwritten, are you sure?")){
                    myCodeMirror.setValue(codeTemplates[codeTemplateSelector.value])
                }
            }
            else{
                myCodeMirror.setValue(codeTemplates[codeTemplateSelector.value])
            }
            saveCurrentCode()
            codeTemplateSelector.value='-'
        });
        document.getElementById('editorSpace').onkeydown=KeyPress
        for(var key in codeTemplates){
            $('#templateSelector').append('<option value="'+key+'">'+key+'</option>')
        }
        loadBrowser()
        refreshUIVisibilities()
        var endposition=$('#outimg1').position()
        console.log('outimg1 after all other init',endposition)
    }
    function setExecutionOrder(){
        var eo=parseInt(document.getElementsByName('execution_order')[0].value)
        datastore.selectionExecutionOrder[datastore.currentSelection]=eo
        if(datastore.highestExecutionOrder < eo){
            datastore.highestExecutionOrder=eo
        }
        saveBrowser()
    }
    function selectionClicked(selection){
        console.log('selection clicked',selection)
        var index=-2
        if(selection.id=='scorebar'){
            index=-1
        }
        else{
            index=parseInt(toN(selection.id))
        }
        document.getElementById('selectionIDNumber').textContent=index+1
        //dont do anything if this selection doesn't actually exist
        //if(!datastore.selections[index]){
        //    return
        //}
        //if(index!=datastore.currentSelection){
            selection.classList.add("selected");
            var oldSelection=-2
            var oldSelectionId=null
            if(datastore.currentSelection==-1){
                oldSelectionId=-1
                oldSelection='scorebar'
            }
            else{
                if(datastore.currentSelection!=-2){
                    oldSelectionId=datastore.currentSelection
                    oldSelection='selectionBox'+datastore.currentSelection
                }
            }
            console.log('selectionclicked oldselection',oldSelection,oldSelectionId,datastore.selections[oldSelectionId])
            if( (datastore.selections[oldSelectionId] || oldSelectionId==-1)){
                console.log('selectionclicked',oldSelection)
                if(oldSelectionId!=-2 && (oldSelection!=selection.id)){
                    document.getElementById(oldSelection).classList.remove("selected")
                }
                var code=datastore.selectionCode[index+1]
                if(code){
                    myCodeMirror.setValue(code)
                }
                else{
                    myCodeMirror.setValue("")
                }
                myCodeMirror.focus()
            }
            datastore.currentSelection=index;
            document.getElementsByName('execution_order')[0].value=datastore.selectionExecutionOrder[index]
            saveBrowser()
        //}
    }
    function dragMoveListener (event) {
        console.log('dragmove')
        var target = event.target.parentElement,
            // keep the dragged position in the data-x/data-y attributes
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // translate the element
        target.style.webkitTransform =
        target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';

        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        
        saveBoxDimensions(parseInt(toN(target.id)))//get the number in the id
        saveBrowser()
      }
  function toN(str){
    return str.replace( /^\D+/g, '')
  }
  function KeyPress(e){
    console.log('key press in editorspace')
    var evtobj = window.event? event : e
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) alert("Ctrl+z");
  }
  function toggleCodebar(x) {
      console.log('togglecodebar')
      x.classList.toggle("change");
      var codebar=document.getElementById('codebar')
      if(datastore.codebarCollapsed){
          console.log('codebar biggger')
        codebar.style.width=datastore.codebarWidth
      }
      else{
          console.log('codebar smaller')
        codebar.style.width=50
      }
      datastore.codebarCollapsed=!datastore.codebarCollapsed
    }
    function newProject(){
        var projectName=prompt("Project Name","")
        if(projectName){
            if(!window.localStorage.CYOA){
                window.localStorage.CYOA=JSON.stringify({})
            }
            window.localStorage.currentProject=projectName
            var newProject={'images':[],'sharedcode':'','selections':[],'codebarCollapsed':false,'codebarWidth':300,'currentSelection':-2,'selectionCode':[],'selectionExecutionOrder':[]}
            window.localStorage['CYOA_'+projectName]=JSON.stringify(newProject)
            //loadProject(projectName)
            //location.reload()
        }
    }
    function loadProject(projectName){
        window.localStorage.currentProject=projectName
        console.log('loading project??',projectName,JSON.parse(window.localStorage.CYOA))
        console.trace()
        datastore=JSON.parse(window.localStorage['CYOA_'+projectName])
        console.log('????',projectName,datastore)
    }
    function publish(){
        var modal = document.getElementById("myModal");
        var span = document.getElementsByClassName("close")[0];
        modal.style.display = "block";
        span.onclick = function() {
          modal.style.display = "none";
        }
        window.onclick = function(event) {
          if (event.target == modal) {
            modal.style.display = "none";
          }
        } 
        myCodeMirrorModal.setValue(JSON.stringify(datastore))
        //myCodeMirrorModal.execCommand('selectAll')
        
        //var file = new File([datastore], "data.json", {type: "text/plain;charset=utf-8"});
        //saveAs(JSON.stringify(datastore),"data.json");
    }
    function importjson(){
        var json=prompt("Please paste JSON text here")
    }
    function setPastebinUrl(){
        console.log('setting pastebin url')
        var url=document.getElementsByName('pastebinurl')[0].value
        var linkElem=document.getElementById('yourcyoalink')
        var cyoaurl=window.location.origin+'/engine.html?paste='+encodeURIComponent(url)
        linkElem.setAttribute("href",cyoaurl);
        linkElem.textContent=cyoaurl
    }
    function selectAllModal(){
        myCodeMirrorModal.execCommand('selectAll')
        myCodeMirrorModal.focus()
        document.execCommand('copy');
    }
    
      // this is used later in the resizing and gesture demos
      window.dragMoveListener = dragMoveListener;

//init()