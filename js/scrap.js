/*             testelem[0].onchange = function (evt) {
                var tgt = evt.target || window.event.srcElement,
                    files = tgt.files;
                // FileReader support
                if (FileReader && files && files.length) {
                    var fr = new FileReader();
                    fr.onload = function () {
                        outimg= document.getElementById("outimg"+i)
                        outimg.src = fr.result;
                        ICYOA.images[i-1]=tgt.files[0].name//outimg.value
                        console.log('should be making option visible now',ICYOA.images[i-1])
                        $('.imageinputform:eq('+i+')').each(function(){
                            console.log('????',i,$(this))
                            $(this).show()
                        });
                    }
                    fr.readAsDataURL(files[0]);
                    //alert('supported')
                }
                // Not supported
                else {
                    alert('browser not supported for image loading')
                    // fallback -- perhaps submit the input to an iframe and temporarily store
                    // them on the server until the user's session ends.
                }
            } */