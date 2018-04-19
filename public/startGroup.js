function updateForm(){
    groupMemberNames[0] = document.getElementById("userName").value;
    var input = document.getElementById("numInGroupInput").value;
    if(boxesCreated < input && input != 0){
        for(var i=boxesCreated; i<input; i++){
        inputBox[boxesCreated] = document.createElement("input");
        inputBox[boxesCreated].setAttribute("type", "text");
        inputBox[boxesCreated].setAttribute("name", `groupMember` + boxesCreated);
        inputBox[boxesCreated].setAttribute("id", `groupMember` + boxesCreated );
        inputBox[boxesCreated].setAttribute("placeholder", `Group Member ` + (boxesCreated+1).toString());
        inputBox[boxesCreated].setAttribute("onchange", "updateForm()");
        inputBox[boxesCreated].style.margin = "5px";
        inputBox[boxesCreated].setAttribute("class", "groupMemberBox form-control mr-sm-2");
        document.getElementById("inputBoxes").appendChild(inputBox[boxesCreated]);
        boxesCreated ++;
        }

    }else if(boxesCreated > input){
        for(var i=boxesCreated; i>input; i--){
        document.getElementById("inputBoxes").removeChild(inputBox[inputBox.length-1]);
        inputBox.pop();
        boxesCreated--;
        }
    }
    if(boxesCreated != 0){
        for(i=0; i<boxesCreated; i++){
            groupMemberNames[i+1] = inputBox[i].value;
            console.log(groupMemberNames);
            localStorage.setItem("groupMemberNamesString", groupMemberNames);
        }
    }
}

