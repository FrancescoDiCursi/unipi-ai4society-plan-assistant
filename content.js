

window.addEventListener("load",()=>{
        chrome.storage.local.get("personal_courses").then((val)=>{
            let already_selected_courses=val["personal_courses"]
            //console.log("ALREADY SELECTED", already_selected_courses)
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
                //console.log(curr_title_txt, already_selected_courses.includes(curr_title_txt))
                if(already_selected_courses.includes(curr_title_txt)){
                    checkbox.checked=true
                    curr_title.style.backgroundColor="green"
                    curr_title.style.color="white"
                }

                checkbox.addEventListener("change",(e)=>{
                    //console.log("INP",e.target.checked)
                    let input_state= e.target.checked
                    //if(input_state===true){
                    //    
                    //}else{
                    //
                    //}
                    //console.log("RESIZE")

                    //take directly all the checked inputs
                    let all_inputs= document.getElementsByClassName("course_inp")
                    let selected_courses=[]
                    for(let j=0;j<all_inputs.length;j++){
                        let curr_inp= all_inputs.item(j)
                        let course_name=curr_inp.nextSibling
                        let course_name_txt=course_name.innerText
                        if (curr_inp.checked===true){
                            //take title
                            ////console.log("STATE",curr_inp.nextSibling.innerText)
                        
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
                        handle_buttons_position(e)

                        //console.log("UPDATED")

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
        
            //console.log(courses_nodes)
            let courses_data =[]
            //take all courses 
            for(let i=0;i<courses_nodes.length;i++){
            
                    let fields_nodes= courses_nodes.item(i)
                    let name_ = fields_nodes.querySelector("h2").innerText
                    let data_nodes= fields_nodes.querySelectorAll("div")
                    let data_={}
                    for (let j=0; j<data_nodes.length; j++){
                        let field= data_nodes.item(j)
                        ////console.log("FIELD: ", field)
                        let label= field.querySelector("strong").innerText.replace(":","").trim()
                        let value= field.querySelector("span").innerText.replace("<br>","")
                        if(label==="Semester" && value.indexOf(",")>-1){
                            //console.log("semester", value, value.split(",").map(d=>d.trim()).join(", ") )
                            value= value.split(",").map(d=>d.trim()).join(",")
                        }
                        data_[label]=value
                    }
                    data_["Name"]=name_
                    ////console.log("VAL", data_)

                    courses_data.push(data_)
                    
        
            }

            create_inpage_counter(courses_data, already_selected_courses)
            handle_buttons_position()

            //console.log("COURSES: ",courses_data)
                //insert table in the page
                ////console.log("C2", courses_data, alread_courses)
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

    //console.log(personal_courses, courses)
    //console.log(n_selected_all, n_selected_exam, n_selected_no_exam)
    //console.log(hours_all, hours_exam, hours_noExam)
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
        ["Selected", String(n_selected_all), String(n_selected_exam)+"/3", String(n_selected_no_exam)],
        ["Hours", String(hours_all), String(hours_exam)+"/80", String(hours_noExam)+"/60"],        
    ]

    //add cols
    let header_row=document.createElement("tr")
    cols.forEach((c,i)=>{
        let header_cell= document.createElement("th")

        header_cell.innerText=c
        header_row.appendChild(header_cell)
    })
    header.appendChild(header_row)

    //console.log("LIMITS", exam_n_limit, hours_exam_limit, hours_noExam_limit)
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
        table_toggle.innerHTML= "ⓘ⇝"
    }else{
        table_toggle.innerHTML= "ⓘ⇜"

    }

    if (exam_n_limit===true && hours_exam_limit===true && hours_noExam_limit){
        table_toggle.style.backgroundColor="green"
        table_toggle.style.color="white"
    }else{
        table_toggle.style.backgroundColor="#D22B2B"
        table_toggle.style.color="white"
    }

    table_toggle.addEventListener("click",(e)=>{
        if (table.className==="table_off"){
           table.className="table_on"
           table_toggle.innerHTML="ⓘ⇜"
        }else if (table.className==="table_on"){
            table.className="table_off"
            table_toggle.innerHTML="ⓘ⇝"
        }

        //remove tooltip if present
        try{
            let tooltip_=document.querySelector("#info_tooltip")
            tooltip_.style.display="none"
        }catch{

        }


        
    })
    table_container.appendChild(table_toggle)

    table_container.appendChild(table)

    //refresh btn
    let refresh_btn=document.createElement("Button")
    refresh_btn.id="refresh_btn"
    refresh_btn.innerHTML="⟳"
    refresh_btn.addEventListener("click",()=>{
            //remove all inputs
            let inputs= document.getElementsByClassName("course_inp")
            let inputs_states=[]
            for(let i=0;i<inputs.length;i++){
                inputs_states.push(inputs.item(i).checked)
            }
            if(inputs_states.filter(f=>f === true).length===0){
                alert("There is no selection to delete.")
            }else{
                let confirm_refresh= window.confirm("Do you really want to delete all selections?")
                if(confirm_refresh){
                    //remove all inputs
                    let inputs= document.getElementsByClassName("course_inp")
                    
                    for(let i=0;i<inputs.length;i++){
                        let curr_inp= inputs.item(i)
                        if (curr_inp.checked===true){
                            curr_inp.click()
                        }
                    }
                }
            }

        //remove tooltip if present
        try{
            let tooltip_=document.querySelector("#info_tooltip")
            tooltip_.style.display="none"
        }catch{

        }
    
    })

    table_container.insertBefore(refresh_btn, table_container.querySelector("btn"))

    //downlaod btn
    let download_btn= document.createElement("button")
    download_btn.id="download_btn"
    download_btn.innerHTML="⭳"
    download_btn.addEventListener("click",()=>{
        let confirm_download= confirm("Do you really want to download your study plan?")
        if(confirm_download){
            let reduced_data= confirm("Do you want to save only selected dimensions?")
            let text_format_flag= confirm("Do you want to download the file as TXT?\n(Press no for CSV)")
            let csv_format_flag
            if(text_format_flag===false){
                csv_format_flag= confirm("Do you want to download the file as CSV?\n(Press no to nullify the download)")
            }else{
                csv_format_flag=false
            }
           
                let reduced_personal_courses=[]
                //get cat handlers from popup.js
                chrome.runtime.sendMessage({"msg":"get_targetted_groups"},(response)=>{
                    if(reduced_data){
                    //console.log("DATA", response)
                    let groups
                    if (response.data.length===0){
                        groups=["Institution","Location","Type", "Attendance Mode","Exam","Lecturers","Email","Academic Year","Semester","Hours", "Timetable","Abstract","Syllabus","Link"]
                    }else{
                        groups= response.data
                    }
                    //console.log("GROUPS",groups)
                    personal_courses.forEach((d,i)=>{
                        let curr_course=personal_courses[i]
                        let new_course={"Name":curr_course["Name"]}
                        let curr_keys=Object.keys(curr_course)
                        curr_keys.forEach((k,j)=>{
                            if(groups.includes(k)){
                                new_course[k]=curr_course[k]
                            }
                        })
                        reduced_personal_courses.push(new_course)

                    })
                    //console.log("REDUCED", reduced_personal_courses)
                    personal_courses=reduced_personal_courses
                    }

                    
                    if(text_format_flag){
                        //create TXT file
                        let txt_file= ""
                        let idx_courses=0
                        //PLAN INFO LIMITS
                        txt_file+="# PLAN VALIDITY:\n\n"
                        txt_file+=`- Minimum number of courses with exam: ${rows[0][2]} (${exam_n_limit})\n`
                        txt_file+=`- Minimum number of hours in courses with exam: ${rows[1][2]} (${hours_exam_limit})\n`
                        txt_file+=`- Minimum number of hours in courses with no exam: ${rows[1][3]} (${hours_noExam_limit})\n`
                        if([exam_n_limit, hours_exam_limit, hours_noExam_limit].every((d)=>d===true)){
                            txt_file+= `\nRESULT: the plan is VALID.`
                        }else{
                            txt_file+= `\nRESULT: the plan is NOT VALID.`
                        }
                        txt_file+="\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n"

                        //with exam
                        txt_file+="# COURSE WITH EXAM\n"
                        personal_courses.filter(f=>f["Exam"]==="Yes").forEach((d,i)=>{
                            //avoid duplicate entries (?)
                            if(!txt_file.includes(`Name: ${d["Name"]};`)){
                                idx_courses+=1
                                let temp_txt=`${idx_courses}) `
                                let curr_obj= d
                                //add name first
                                temp_txt+=`Name: ${curr_obj["Name"]};\n\n`
                                Object.keys(curr_obj).forEach((k,j)=>{
                                    if(k!=="Name"){
                                        let temp_el=`- ${k}: ${curr_obj[k]};\n\n`
                                        temp_txt+=temp_el
                                    }

                                }) 
                                //temp_txt+="\n\n"
                                if(i===0){
                                    txt_file+="\n"+temp_txt
                                }else{
                                    txt_file+="\n*************\n"+temp_txt  
                                }
                            }

                        })
                        txt_file+="\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n"

                        //without exam
                        txt_file+="# COURSES WITHOUT EXAM\n"
                        
                        personal_courses.filter(f=>f["Exam"]==="No").forEach((d,i)=>{
                            //avoid duplicate entries (?)
                            if(!txt_file.includes(`Name: ${d["Name"]};`)){
                                idx_courses+=1
                                let temp_txt=`- ${idx_courses}) `
                                let curr_obj= d
                                ////console.log("NO EXAM NAME: ",curr_obj["Name"] )

                                //add name first
                                temp_txt+=`Name: ${curr_obj["Name"]};\n\n`
                                Object.keys(curr_obj).forEach((k,j)=>{
                                    if(k!=="Name"){
                                        let temp_el=`- ${k}: ${curr_obj[k]};\n\n`
                                        temp_txt+=temp_el
                                    }

                                }) 
                                temp_txt+="\n\n"
                                if(i===0){
                                    txt_file+="\n"+temp_txt
                                }else{
                                    txt_file+="\n*************\n"+temp_txt  
                                }
                            }

                        })

                        //console.log("txt", txt_file)
                        //download text from blob
                        let blob= new Blob([txt_file],{type:"text/plain"})
                        let url = URL.createObjectURL(blob)
                        //download from background page
                        chrome.runtime.sendMessage({"msg":"download_txt_file","data":url})
                    }else if(csv_format_flag){
                        //create CSV file
                        let csv_file= csvmaker(personal_courses)
                        //console.log("CSV", csv_file)
                        //download csv from blob
                        let blob= new Blob([csv_file],{type:"text/csv;charset=utf-8"})
                        let url = URL.createObjectURL(blob)
                        //download from background page
                        chrome.runtime.sendMessage({"msg":"download_csv_file","data":url})
                    }


                })
            

        }
        
         //remove tooltip if present
         try{
            let tooltip_=document.querySelector("#info_tooltip")
            tooltip_.style.display="none"
        }catch{

        }
    })
    table_container.appendChild(download_btn)

    //append import btn
    let import_btn=document.createElement("button")
    import_btn.id="import_btn"
    import_btn.innerHTML="💾"
    import_btn.addEventListener("click", async ()=>{
        [fileHandle]= await window.showOpenFilePicker()
        const file_= await fileHandle.getFile()
        const file_content = await file_.text()
        let imported_names=[]
        if(file_.name.endsWith(".csv")){
            //get only names
            file_content.split("\n").forEach((l,i)=>{
                if(i>0){ //skip header
                    let line= l.split(",")
                    let curr_name=line[0]
                    if(curr_name!==""){
                        imported_names.push(curr_name)
                    }
                }
            })
        }else if(file_.name.endsWith(".txt")){
            file_content.split("\n").forEach((l,i)=>{
                let line=l
                if(line.includes("Name:")){
                    let curr_name= line.split("Name:")[1].trim().replace(";","")
                    if(curr_name!==""){
                        imported_names.push(curr_name)
                    }
                }
            })
        }else{
            alert("File format must be TXT or CSV!")
            return
        }
        //remove old selections
        let inputs= document.getElementsByClassName("course_inp")
                    
        for(let i=0;i<inputs.length;i++){
            let curr_inp= inputs.item(i)
            if (curr_inp.checked===true){
                curr_inp.click()
            }
        }
        //
        //click imported names
        let node_titles= document.getElementsByClassName("views-field-title")
        for(let i=0;i<node_titles.length;i++){
            let curr_node= node_titles.item(i)
            let curr_title_txt= curr_node.innerText
            let curr_inp= curr_node.parentElement.querySelector(".course_inp")
            if(imported_names.includes(curr_title_txt)){
                curr_inp.click()
            }
        }
        //console.log(imported_names)
    })
    table_container.appendChild(import_btn)

    //append guide btn
    let guide_btn=document.createElement("button")
    guide_btn.id="guide_btn"
    guide_btn.innerHTML="?"
    guide_btn.addEventListener("click",()=>{
        let confirm_flag= confirm("Do you want to open the complete guide?")
        if(confirm_flag){
            var newURL = "https://github.com/FrancescoDiCursi/unipi-phd-ai4society-courses-selection-assistant#readme";
            window.open(newURL, "_blank")
        }
    })
    table_container.appendChild(guide_btn)


    //append tooltip
    let info_tooltip= document.createElement("span")
    info_tooltip.id="info_tooltip"
    table_container.appendChild(info_tooltip)

    

    //handle tooltip
    refresh_btn.addEventListener("mouseenter",(e)=>{
        info_tooltip.style.display="block"
        info_tooltip.innerHTML="<b>Reset the study plan</b>"
        info_tooltip.style.top="-70px" //e.target.style.top
    })

    refresh_btn.addEventListener("mouseleave",()=>{
        info_tooltip.style.display="none"
        info_tooltip.style.top="0px"
        info_tooltip.innerHTML=""


    })

    
    table_toggle.addEventListener("mouseenter",(e)=>{
        info_tooltip.style.display="block"
        info_tooltip.innerHTML="<b>Show counters and plan validity</b><br>(red = invalid; green = valid)"
        info_tooltip.style.top="15px" //e.target.style.top
    })

    table_toggle.addEventListener("mouseleave",()=>{
        info_tooltip.style.display="none"
        info_tooltip.style.top=0
        info_tooltip.innerHTML=""

    })

    download_btn.addEventListener("mouseenter",(e)=>{
        info_tooltip.style.display="block"
        info_tooltip.innerHTML="<b>Download study plan</b><br>(TXT or CSV)"

        info_tooltip.style.top="115px" //e.target.style.top
    })

    download_btn.addEventListener("mouseleave",()=>{
        info_tooltip.style.display="none"
        info_tooltip.style.top=0
        info_tooltip.innerHTML=""


    })
    
    import_btn.addEventListener("mouseenter",(e)=>{
        info_tooltip.style.display="block"
        info_tooltip.innerHTML="<b>Import a study plan</b><br>(TXT or CSV)"

        info_tooltip.style.top="215px" //e.target.style.top
    })

    import_btn.addEventListener("mouseleave",()=>{
        info_tooltip.style.display="none"
        info_tooltip.style.top=0
        info_tooltip.innerHTML=""


    })

    guide_btn.addEventListener("mouseenter",(e)=>{
        info_tooltip.style.display="block"
        info_tooltip.innerHTML="<b>- Click on this button to go to the complete guide</b>;<br>- Hover on buttons to inspect their functions;<br>- Click on the extension icon to see more!<br>- In the extension popup, click on 'Toggle handlers' to filter by dimensions;<br>- In the extension popup, click on the plot to filter the table."
        info_tooltip.style.top="-140px" //e.target.style.top
    })

    guide_btn.addEventListener("mouseleave",()=>{
        info_tooltip.style.display="none"
        info_tooltip.style.top="0px"
        info_tooltip.innerHTML=""


    })
   

    //meta_div
    let meta_div= document.createElement("div")
    meta_div.id="table_meta_container"

    meta_div.appendChild(table_container)

    let parent_=document.getElementsByClassName("view-content")[0]
    //last append
    parent_.insertBefore(meta_div,parent_.firstChild)

    

}


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.message === "clear" ) {
            let refresh_btn = document.getElementById("refresh_btn")
            refresh_btn.click()
        } else if( request.message === "infos" ) {
            let table_toggle = document.getElementsByClassName("table_toggle")[0]
            table_toggle.click()
        } else if( request.message === "download"){
            let download_btn= document.getElementById("download_btn")
            download_btn.click()
        } else if( request.message === "import"){
            let import_btn= document.getElementById("import_btn")
            import_btn.click()
        }
    }
);

function csvmaker (items) {

  
    let csv

    // Loop the array of objects
    for(let row = 0; row < items.length; row++){
        let keys_=Object.keys(items[0])
        //console.log("ORIGINAL", keys_)
        if(keys_[0]!=="Name"){
            keys_.pop("Name")
            keys_.unshift("Name")
            //console.log("updated", keys_)
    
        }

        let keysAmount = keys_.length
        let keysCounter = 0

        // If this is the first row, generate the headings
        if(row === 0){
            
            // Loop each property of the object
            for(let j=0;j<keys_.length;j++){
                let key= keys_[j]
                                // This is to not add a comma at the last cell
                                // The '\r\n' adds a new line
                csv += key + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
                keysCounter++
            }
            for(let j=0;j<keys_.length;j++){
                let key= keys_[j]
                csv += items[row][key].replaceAll("\n"," <new_line> ").replaceAll(","," <comma> ").replace(" <new_line>  <new_line> "," <new_line>") + (j+1<keys_.length ? ',' : '\r\n' )
                keysCounter++
            }
        }else{
       
            for(let j=0;j<keys_.length;j++){
                let key= keys_[j]
                csv += items[row][key].replaceAll("\n"," <new_line> ").replaceAll(","," <comma> ").replace(" <new_line>  <new_line> "," <new_line>") + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
                keysCounter++
            }
        }

        keysCounter = 0
    }
    // Returning the array joining with new line  
    return csv.replace("undefined","")
}

function handle_buttons_position(e=""){
    let width_=window.innerWidth
    let height_=window.innerHeight

    let left_
    if(width_>1560){
        left_="-20%"
    }else if(width_>1300 && width_<=1560){
        left_="-7%"
    }else if(width_>1000  && width_<=1300){
        left_="-5%"
    }else if(width_>900  && width_<=1000){
        left_="-10%"
    
    }else if(width_>600  && width_<=900){
        left_="-5%"
    }else{
        left_="0%"
    }

    let meta_div= document.getElementById("table_meta_container")
    meta_div.style.left=left_
    if (e===""){
        const debounce = (func, wait, immediate) => {
            var timeout;
            return () => {
                const context = this, args = arguments;
                const later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };
    
        window.addEventListener('resize', debounce(handle_buttons_position,
    200, false), false);
    }
    

}

