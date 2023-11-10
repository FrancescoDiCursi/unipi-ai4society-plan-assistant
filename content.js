

window.addEventListener("load",()=>{
        chrome.storage.local.get("personal_courses").then((val)=>{
            let already_selected_courses=val["personal_courses"]
            console.log("ALREADY SELECTED", already_selected_courses)
            if(already_selected_courses===undefined){
                already_selected_courses=[]
            }


            let courses_nodes=document.getElementsByClassName("views-row")
            //add checkboxes to titles
            for(let i=0;i<courses_nodes.length;i++){
                let hr = document.createElement("hr")
                let curr_node= courses_nodes.item(i)
                let curr_title= curr_node.getElementsByClassName("views-field-title")[0]
                let curr_title_txt= curr_title.textContent.trim()
                let checkbox= document.createElement("input")
                checkbox.className="course_inp"
                checkbox.type="checkbox"
                checkbox.style.marginLeft="50%"
                checkbox.style.marginBottom="-50px"
                console.log(curr_title_txt, already_selected_courses.includes(curr_title_txt))
                if(already_selected_courses.includes(curr_title_txt)){
                    checkbox.checked=true
                    curr_title.style.backgroundColor="green"
                    curr_title.style.color="white"
                }

                checkbox.addEventListener("change",(e)=>{
                    console.log("INP",e.target.checked)
                    let input_state= e.target.checked
                    //if(input_state===true){
                    //    
                    //}else{
                    //
                    //}

                    //take directly all the checked inputs
                    let all_inputs= document.getElementsByClassName("course_inp")
                    let selected_courses=[]
                    for(let j=0;j<all_inputs.length;j++){
                        let curr_inp= all_inputs.item(j)
                        let course_name=curr_inp.nextSibling
                        let course_name_txt=course_name.innerText
                        if (curr_inp.checked===true){
                            //take title
                            //console.log("STATE",curr_inp.nextSibling.innerText)
                        
                            course_name.style.backgroundColor="green"
                            course_name.style.color="white"

                            selected_courses.push(course_name_txt)
                        }else{
                            course_name.style.backgroundColor="transparent"
                            let default_color="#003c71"
                            course_name.style.color=default_color

                        }
                    }
                    
                    chrome.storage.local.set({"personal_courses":selected_courses}) //CONTENT.JS STORAGE !== POPUP/BACKGROUND STORAGE
                    //update inpage table
                    chrome.storage.local.get("all_courses").then((val)=>{
                        let courses_data= val["all_courses"]
                        create_inpage_counter(courses_data,selected_courses)
                        console.log("UPDATED")

                    })


                    //send to background in order to update background-popup storage
                    chrome.runtime.sendMessage({
                        msg: "personal list updated",
                        data:selected_courses
            
                    }, function (response) {
                    return true;
                    });
                })
                

                
                curr_node.insertBefore(checkbox,curr_title)
                curr_node.insertBefore(hr, checkbox)

            }
        
            console.log(courses_nodes)
            let courses_data =[]
            //take all courses 
            for(let i=0;i<courses_nodes.length;i++){
            
                    let fields_nodes= courses_nodes.item(i)
                    let name_ = fields_nodes.querySelector("h2").innerText
                    let data_nodes= fields_nodes.querySelectorAll("div")
                    let data_={}
                    for (let j=0; j<data_nodes.length; j++){
                        let field= data_nodes.item(j)
                        //console.log("FIELD: ", field)
                        let label= field.querySelector("strong").innerText.replace(":","").trim()
                        let value= field.querySelector("span").innerText.replace("<br>","")
                        data_[label]=value
                    }
                    data_["Name"]=name_
                    //console.log("VAL", data_)

                    courses_data.push(data_)
                    
        
            }
            create_inpage_counter(courses_data, already_selected_courses)

            console.log("COURSES: ",courses_data)
                //insert table in the page
                //console.log("C2", courses_data, alread_courses)
            chrome.storage.local.set({"all_courses":courses_data})
            chrome.runtime.sendMessage({
                msg: "storage updated",
                data:courses_data

            }, function (response) {
            return true;
            });
        })
        




})

function create_inpage_counter(courses, personal_courses){
    let table_container
    let was_open
    try{
        table_container=document.getElementById("custom_table_container")
        let tab_=table_container.getElementsByTagName("table").item(0)
        let tab_state= tab_.className.replace("table_","")
        if (tab_state==="on"){
            was_open=true
        }else if(tab_state==="off"){
            was_open=false
        }
        table_container.innerHTML=""


    }catch{
        was_open=false
       table_container=document.createElement("div")
       table_container.id="custom_table_container"
    }
    //

    //Table with columns= All, Exam, No exam
                //rows= n_selected, hours9
    personal_courses= courses.filter(d=>personal_courses.includes(d["Name"])) //from name to complete obj
    let n_selected_all= personal_courses.length
    let n_selected_exam= personal_courses.filter(d=>d["Exam"]==="Yes").length
    let n_selected_no_exam= personal_courses.filter(d=>d["Exam"]==="No").length

    let hours_all=0
    let hours_exam=0
    let hours_noExam=0

    personal_courses.forEach((d,i)=>{
        hours_all+= +d["Hours"]
        if(d["Exam"]==="Yes"){
            hours_exam+= +d["Hours"]
        }else if(d["Exam"]==="No"){
            hours_noExam+= +d["Hours"]
        }
    })
    //check for limits
    let exam_n_limit= n_selected_exam >= 3
    let hours_exam_limit= hours_exam >= 80
    let hours_noExam_limit= hours_noExam >= 60

    console.log(personal_courses, courses)
    console.log(n_selected_all, n_selected_exam, n_selected_no_exam)
    console.log(hours_all, hours_exam, hours_noExam)
    let table =document.createElement("table")
    if (was_open===true){
        table.className="table_on"
    }else{
        table.className="table_off"
    }
    let header = document.createElement("thead")
    let body= document.createElement("tbody")

    let cols=["","All","Exam", "No exam"]
    let rows=[
        ["Selected", String(n_selected_all), String(n_selected_exam)+"\\3", String(n_selected_no_exam)],
        ["Hours", String(hours_all), String(hours_exam)+"\\80", String(hours_noExam)+"\\60"],        
    ]

    //add cols
    let header_row=document.createElement("tr")
    cols.forEach((c,i)=>{
        let header_cell= document.createElement("th")

        header_cell.innerText=c
        header_row.appendChild(header_cell)
    })
    header.appendChild(header_row)

    console.log("LIMITS", exam_n_limit, hours_exam_limit, hours_noExam_limit)
    //add rows
    rows.forEach((r,i)=>{
        let row= document.createElement("tr")
        cols.forEach((c,j)=>{
            let cell=  document.createElement("td")
            if (j===0){
                cell.className="table_idx"
            }

            //apply limits with classes
            if (i===0 && j===2){ //selected with exam 
                if(exam_n_limit===true){
                    cell.className="td_ok"
                }else{
                    cell.className="td_no"
                }
            }
            else if (i===1 && j===2){ //hours with exam 
                if(hours_exam_limit===true){
                    cell.className="td_ok"
                }else{
                    cell.className="td_no"
                }
            }
            else if (i===1 && j===3){ //selected without exam 
                if(hours_noExam_limit===true){
                    cell.className="td_ok"
                }else{
                    cell.className="td_no"
                }
            }
            cell.innerText=r[j]
            row.appendChild(cell)
        })
        body.appendChild(row)
    })
    table.appendChild(header)
    table.appendChild(body)

  


    //append the toggle to the table
    let table_toggle= document.createElement("button")
    table_toggle.className="table_toggle"
    if (was_open===false){
        table_toggle.innerHTML= "⇝"
    }else{
        table_toggle.innerHTML= "⇜"

    }

    if (exam_n_limit===true && hours_exam_limit===true && hours_noExam_limit){
        table_toggle.style.backgroundColor="green"
        table_toggle.style.color="white"
    }else{
        table_toggle.style.backgroundColor="red"
        table_toggle.style.color="white"
    }

    table_toggle.addEventListener("click",(e)=>{
        if (table.className==="table_off"){
           table.className="table_on"
           table_toggle.innerHTML="⇜"
        }else if (table.className==="table_on"){
            table.className="table_off"
            table_toggle.innerHTML="⇝"
        }


        
    })
    table_container.appendChild(table_toggle)

    table_container.appendChild(table)


    document.body.insertBefore(table_container, document.body.firstChild)

    

}


