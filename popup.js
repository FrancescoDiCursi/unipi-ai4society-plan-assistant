
document.addEventListener("DOMContentLoaded",()=>{
    //START
    chrome.storage.local.get("all_courses").then((value)=>{
        let courses= value["all_courses"]
        let all_cats= ["Institution","Type","Attendance Mode","Exam","Semester","Hours","Academic Year"]
        //toggle button for cats
        let toggle_cats= document.getElementById("toggle_categories")
        toggle_cats.addEventListener("click",toggle_cat_selector)
        toggle_cats.click() // needs first click to init




        //get targetted_groups
        chrome.storage.local.get("targetted_groups").then((val)=>{
            let targetted_groups = val["targetted_groups"]
            if(targetted_groups.length===0){
                //still no course selected
                targetted_groups=["Institution", "Type","Attendance Mode", "Semester","Exam","Hours","Academic Year"]
            }
            //create inputs
            create_cat_selectors(all_cats,courses,targetted_groups)
            //create general plot
            //create_parallel_catplot("", courses, targetted_groups,"all_courses_cont")
            create_section_toggles()
            create_links_from_h3() //click in the popup.js is defered to content.js
            //get personal courses
            chrome.storage.local.get("personal_courses").then((val2)=>{
                let personal_names= val2["personal_courses"]
                let personal_courses= []
                for(let i=0;i<courses.length;i++){
                    if(personal_names.includes(courses[i]["Name"])){
                        personal_courses.push(courses[i])
                    }
                }
                console.log("PERSONAL COURSES",personal_courses)
                //create_parallel_catplot("", personal_courses,  targetted_groups, "personal_courses_cont")

                //set courses counters
                let all_courses_counter= document.getElementById("n_all_courses")
                let personal_courses_counter=document.getElementById("n_personal_courses")
                all_courses_counter.innerHTML=String(courses.length)+"/"+String(courses.length)
                personal_courses_counter.innerHTML=String(personal_courses.length)+"/"+String(personal_courses.length)
                //click create plots
                let draw_plots_btn= document.getElementById("save_cat_btn")
                draw_plots_btn.click()

                let all_courses_list_cont= document.getElementById("all_courses_list")
                //create course list
                create_exam_list(courses, targetted_groups, all_courses_list_cont)
                let personal_courses_list_cont= document.getElementById("personal_courses_list")
                create_exam_list(personal_courses, targetted_groups, personal_courses_list_cont)
                
            })
        })

        
        


    })


    //activate when selecting or deselecting courses on the page
    chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
        //get the data from all_courses
        console.log("MESSAGE", message)
        let targetted_groups=["Institution", "Type","Attendance Mode", "Semester","Exam","Hours"] //these will be chosen by the user among a set of predetermianted groups
        if(message.msg === "personal list updated"){
            let personal_names=message.data
            chrome.storage.local.get("all_courses").then((val)=>{
                let all_courses= val["all_courses"]
                let personal_courses= []
                for(let i=0;i<all_courses.length;i++){
                    if(personal_names.includes(all_courses[i]["Name"])){
                        personal_courses.push(all_courses[i])
                    }
                }
                console.log(all_courses, personal_names, personal_names.includes(all_courses[0]["Name"]))
                console.log("PERSONAL", personal_courses)

                let personal_courses_list_cont= document.getElementById("personal_courses_list")
                create_exam_list(personal_courses, targetted_groups, personal_courses_list_cont)

                create_parallel_catplot("", personal_courses,  targetted_groups, "personal_courses_cont")

            })
        }
    })




    function custom_group_by(data, groups){
    grouped = {};

    data.forEach(function (a) {
            groups.reduce(function (o, g, i) {                            // take existing object,
                o[a[g]] = o[a[g]] || (i + 1 === groups.length ? [] : {}); // or generate new obj, or
                return o[a[g]];                                           // at last, then an array
            }, grouped).push(a);
        });

        console.log(grouped)
        return grouped
    }


    function parallel_catplot_format(data, groups){
        //take only vals in groups
        let filt_data=[]
        console.log("DATA", data)
        try{
            //data= data.target.courses
            console.log("DATA2",data.target.courses)
            data= data.target.courses //in case
        }catch{

        }
        data.forEach(d=>{
            let temp_keys= Object.keys(d)
            let temp_obj={}
            temp_keys.forEach(k=>{
                if(groups.includes(k)){
                    temp_obj[k]= d[k]
                }
            })
            filt_data.push(temp_obj)
        })
        //console.log(filt_data)

        let lists=[]
        //get parallel lists
        for(let i=0; i<groups.length;i++){
            let g= groups[i]
            let temp_list=[]
            for(let j=0; j<filt_data.length;j++){
                //console.log(g, filt_data[j][g])
                temp_list.push(filt_data[j][g])
            }
            lists.push(temp_list)
        }

        //console.log(lists)
        //turn lists to dimensions

        dimensions=[]

        for(let i=0;i<groups.length;i++){
            dimensions.push({label:groups[i], values:lists[i]})
        }

        console.log(dimensions)
        return dimensions

    


    }




    function get_level_entries(data){
    
            let temp_entries=Object.entries(data)
            let temp_keys= temp_entries.map(d=>d[0])
            let temp_vals= temp_entries.map(d=>d[1])
            console.log("TEMP", temp_keys)
            return  temp_vals
        
        

    

    }

    function iterateObject(obj, len){
        for (var key in obj){
            try{
                if( obj[key].push() ){  //
                    console.log("LEAF = ",key + ":", obj[key])
                    all_labels.push(o)
                }
            } catch{
            
                    iterateObject(obj[key])
                    console.log(key + ":", obj[key])
                
            
                
            }
        }
        
    }

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function create_parallel_catplot(title,courses,groups,div){
            //treemap_format(grouped_data, groups)
            let dimensions=parallel_catplot_format(courses,groups)  
            
            // Colors
            var color = new Int8Array(courses.length);
            var colorscale = [[0, 'gray'], [1, 'firebrick']];

            //build trace
            var trace1={
                type:"parcats",
                dimensions:dimensions,
                hoverinfo: "count+probability",
                hoveron:"color",
                line: {
                    colorscale: colorscale,
                    cmin: 0,
                    cmax: 1,
                    color: color,
                    shape: 'hspline'},
                labelfont: {size: 14}
            }

        
            var data= [trace1]
            var layout={width:800, height:600, margin:{l:200,t:50,b:50},title:title}
        
            Plotly.newPlot(div, data, layout)

            //ADD PLOT SELECTION AND USE TO FILTER THE RELATIVE TABLE!
            //CONTINUE FROM HERE
            let plot_div= document.querySelector(`#${div}`)
            console.log("PLOT DIV", plot_div)
            let new_color = new Int8Array(courses);

            plot_div.on("plotly_click", function (event) {
              var selection = [];
              for (var i = 0; i < event.points.length; i++) {
                if (new_color[event.points[i].pointNumber] == 1) {
                  new_color[event.points[i].pointNumber] = 0;
                } else {
                  new_color[event.points[i].pointNumber] = 1;
                }
                selection.push(event.points[i].pointNumber);
              }
      
              Plotly.restyle(div, { "line.color": [new_color] });

              let filters_= get_filters(plot_div,groups)
              //add here
              let selected_courses= filter_table_data(courses, filters_)
              let list_div= document.getElementById(div.replace("cont","list"))
              create_exam_list(selected_courses ,groups, list_div)
              //update counter
              let counter_id_el= "n_" + div.replace("_cont","")
              let counter_el= document.getElementById(counter_id_el)
              counter_el.innerHTML=`${selected_courses.length}/${courses.length}`
              


            });

             //add_refresh_btn
             let refresh_selection=document.createElement("button")
             refresh_selection.className="refresh_selection_btn"
             refresh_selection.innerHTML="Reset selection"
             refresh_selection.addEventListener("click",()=>{
                 let new_color = new Int8Array(courses.length); 
                 for(var i = 0; i < plot_div.querySelectorAll("g"); i++) {
                     new_color.push(0);
                   }
                 var update = {'line.color':[new_color]};
                 Plotly.restyle(div, update);

                 let filters_= get_filters(plot_div,groups)
                 //add here
                 let selected_courses= filter_table_data(courses, filters_)
                 let list_div= document.getElementById(div.replace("cont","list"))
                 create_exam_list(selected_courses ,groups, list_div)
                //update counter
                let counter_id_el= "n_" + div.replace("_cont","")
                let counter_el= document.getElementById(counter_id_el)
                counter_el.innerHTML=`${selected_courses.length}/${courses.length}`
   

             })
             let plot_div_parent=  plot_div.parentElement
             if (plot_div_parent.querySelectorAll(".refresh_selection_btn").length===0){
                plot_div.parentElement.insertBefore(refresh_selection, plot_div)
             }

             

    }

    function get_filters(plot_div, targetted_groups){
        //get selection categories in order to filter the table
        let dimensions_=plot_div.getElementsByClassName("dimension")
        let target_dimensions={}
        for(let i=0;i<dimensions_.length;i++){
           let temp_axis=dimensions_.item(i)
           //check if red element
           let dimension_label= temp_axis.querySelector(".dimlabel").innerHTML
           if (dimension_label===""){
            dimension_label=targetted_groups[i]
           }
           console.log("dimlabel",dimension_label)
           target_dimensions[dimension_label]=[]
           let axis_els=temp_axis.querySelectorAll(".bandrect")

           let is_red=false
           for(let j=0;j<axis_els.length;j++){
               let curr_el= axis_els.item(j)
               let curr_el_color= curr_el.getAttribute("fill")
               console.log("COLOR", curr_el_color)
               if (curr_el_color==="rgb(178, 34, 34)"){
                   is_red=true
                   //get label of el
                   let curr_el_label=curr_el.parentElement.querySelector(".catlabel").innerHTML
                   target_dimensions[dimension_label]=[... target_dimensions[dimension_label], curr_el_label]
               }
           }
        }

        console.log("DIMENSIONS", target_dimensions)
        let filters = {}
        Object.keys(target_dimensions).forEach((k,i)=>{
            if(target_dimensions[k].length>0){
                filters[k]=target_dimensions[k]
            }
        })
        return filters
    }
    
    function filter_table_data(courses, filters){
        //CONTINUE FROM HERE!!
        let courses_copy= [... courses]
        let filter_keys= Object.keys(filters)
        let filter_courses=[]
        courses.forEach((c,i)=>{
            let curr_course=courses[i]
            let valid_el=false
            let flags_=[]
           filter_keys.forEach((f_k,j)=>{
                let curr_el= curr_course[f_k]
                if(filters[f_k].includes(curr_el)){
                    flags_.push(true)
                }else{
                    flags_.push(false)
                }
            })
            valid_el= flags_.every(d=>d===true)
            if(valid_el){
                filter_courses.push(curr_course)
            }
        })
        console.log("FILTERD COURSE", filter_courses)
        return filter_courses

    }


    function toggle_cat_selector(){
        document.querySelector("#cat_selector_cont").style.display==="none" ?document.querySelector("#cat_selector_cont").style.display="block" :document.querySelector("#cat_selector_cont").style.display="none"
    }

    function create_cat_selectors(all_cats, courses, targetted_groups){
        let cats_div= document.getElementById("cat_selector_cont")
        //check if there are old handler inputs
        all_cats.forEach((cat,i)=>{
            let temp_row= document.createElement("div")
            temp_row.className="cat_row"
            let int_inp= document.createElement("input")
            int_inp.type="number"
            int_inp.className="int_inp"
            int_inp.min="0"
            int_inp.max="6"
            if(all_cats.length!==targetted_groups.length && targetted_groups.length>0){
                if (targetted_groups.includes(cat)){
                    int_inp.value= targetted_groups.indexOf(cat)+1
                }else{
                    int_inp.value=""
                }
            }else if(all_cats.length===targetted_groups.length || targetted_groups.length===0){
                int_inp.value= i+1 //default all selected
            }
            let cat_text= document.createElement("span")
            cat_text.innerText=cat
            cat_text.className="label_inp"

            temp_row.appendChild(int_inp)
            temp_row.appendChild(cat_text)

            cat_selector_cont.appendChild(temp_row)
            


        })

        let save_cat_btn=document.createElement("button")
        save_cat_btn.innerText="Plot categories"
        save_cat_btn.id="save_cat_btn"
        save_cat_btn.addEventListener("click",handle_saved_cats)
        cats_div.appendChild(save_cat_btn)
    }

    function handle_saved_cats(){
        chrome.storage.local.get("all_courses").then((val)=>{
            let courses= val["all_courses"]

                //get rows
                let vals= document.getElementsByClassName("int_inp")
                let cats= document.getElementsByClassName("label_inp")

                let vals_txt=[]
                let cats_txt=[]

                for(let i=0;i<vals.length;i++){
                    if(vals.item(i).value===""){
                        vals_txt.push(0)
                    }else{
                        vals_txt.push(+vals.item(i).value)
                    }
                    cats_txt.push(cats.item(i).textContent)
                }

                //check if multiple vals are present: if so throuw error
                const counts = {};
                let error_=false

                vals_txt.forEach((el) => {
                    if(el!==0){
                        counts[el] = counts[el] ? (counts[el] + 1) : 1;
                    }

                    if(counts[el]>1){
                        error_=true
                    }
                });

                if(error_){
                    alert("Inputs cannot have repeated integers!")
                    return []
                }else{
                
                    let new_obj= Object.fromEntries(cats_txt.map((k,i)=>[k, vals_txt[i]]))
                    let final_list= Object.entries(new_obj).filter(f=>f[1]>0)
                    final_list= final_list.sort(function(a,b){return a[1]-b[1]})
                    console.log(final_list)
                    if (final_list.length===0){
                        alert("Insert an integer in at least one category!")
                    }else{
                        //write path on popup.js
                        let cat_selected_cont= document.getElementById("cat_selected_cont")
                        let ordered_cats= final_list.map(d=>d[0])
                        console.log(ordered_cats)
                        cat_selected_cont.innerText=ordered_cats.join(" > ")

                        let targetted_groups= final_list.map(d=>d[0])

                        //save cats inputs
                        chrome.storage.local.set({"targetted_groups":targetted_groups}).then(()=>{
                            chrome.storage.local.get("personal_courses").then((val2)=>{
                                let personal_names=val2["personal_courses"]
                                let personal_courses= []
                                for(let i=0;i<courses.length;i++){
                                    if(personal_names.includes(courses[i]["Name"])){
                                        personal_courses.push(courses[i])
                                    }
                                }
                                console.log("PERSONAL_COURSES", personal_courses)
                                let all_courses_list_cont= document.getElementById("all_courses_list")
                                create_exam_list(courses, targetted_groups, all_courses_list_cont)
                                let personal_courses_list_cont= document.getElementById("personal_courses_list")
                                create_exam_list(personal_courses, targetted_groups, personal_courses_list_cont)
                                create_parallel_catplot("", courses, targetted_groups,"all_courses_cont")
                                create_parallel_catplot("", personal_courses,  targetted_groups, "personal_courses_cont")
                            })

                        })

                        //remove  catplot reset selection btn  .refresh_selection_btn
                        let refresh_btns=document.getElementsByClassName("refresh_selection_btn")
                        for(let i=0;i<refresh_btns.length;i++){
                            refresh_btns.item(i).remove()
                        }



                        return targetted_groups

                    }

                }
        })

        
    }

    function create_exam_list(courses,targetted_groups_, div, sort_arrow_asc=true, target_col=""){
    //create a copy
    let targetted_groups= [...targetted_groups_]
    if(!targetted_groups.includes("Name")){
        targetted_groups.unshift("Name")

    }

    //empty div
    div.innerHTML=""
    //filter data dimensions
    let filtered_data=[]
    for (let i=0;i<courses.length;i++){
        let curr_obj=courses[i]
        let curr_keys= Object.keys(curr_obj)
        let filt_obj={}

        curr_keys.forEach((k,i)=>{
            curr_obj[k]=String(curr_obj[k])
            if(targetted_groups.includes(k)){
                filt_obj[k]= curr_obj[k]
            }

        })
        //fill missing fields
        targetted_groups.forEach((k)=>{
                if (!Object.keys(filt_obj).includes(k)){
                    filt_obj[k]="N/D"
                }
        })
        
        filtered_data.push(filt_obj)
    }
    console.log("FILT OBJS", filtered_data)
    //create a table
    let table=document.createElement("table")
    let tab_header= document.createElement("thead")
    let tab_body= document.createElement("tbody")

    //create header cells
    let header_row= document.createElement("tr")
    targetted_groups.forEach((g,i)=>{
        let header_cell= document.createElement("th")
        let sort_btn= document.createElement("btn")
        if(g===target_col){
            sort_btn.innerHTML=sort_arrow_asc===true ?"↑" :"↓" 
        }else{
            sort_btn.innerHTML="↕"
        }
        sort_btn.className="sort_btn"
        sort_btn.id="sort_"+g.replace("Attendance ","").replace("Academic ","")
        sort_btn.addEventListener("click",(e)=>{
            console.log(e.target.id)
            let group= e.target.id.split("_")[1]
            if(group==="Mode"){
                group= "Attendance Mode"
            }else if(group==="Year"){
                group= "Academic Year"
            }
            console.log("SORT ON", group)
            let sorted_courses= [... courses]
            if (e.target.innerHTML==="↑" || e.target.innerHTML==="↕"){ //ascending: from top to bottom (FIRST CLICK)
                try{
                    sorted_courses.sort((a, b) => a[group].localeCompare(b[group]));
                }catch{
                    sorted_courses.sort((a, b) => String(a[group]).localeCompare(String(b[group])));
                }
            }else if(e.target.innerHTML==="↓"){
                try{
                    sorted_courses.sort((a, b) => b[group].localeCompare(b[group])).reverse();
                }catch{
                    sorted_courses.sort((a, b) => String(a[group]).localeCompare(String(b[group]))).reverse();
                }
            }



            console.log("SORTED", sorted_courses)
            div.innerHTML=""
            if(e.target.innerHTML==="↕"){
                create_exam_list(sorted_courses,targetted_groups, div, sort_arrow_asc=false, target_col=group)

            }else{
                create_exam_list(sorted_courses,targetted_groups, div, sort_arrow_asc=!sort_arrow_asc, target_col=group)
            }
        })

        //header_cell.innerText= g==="Attendance Mode" ?"Mode" :g
        header_cell.innerText= g==="Attendance Mode" ?"Mode" :g==="Academic Year" ?"Year" :g


        header_cell.appendChild(sort_btn)
        header_row.appendChild(header_cell)
    })
    tab_header.appendChild(header_row)

    //create a row for each element
    filtered_data.forEach((obj,i)=>{
        let body_row= document.createElement("tr")
        //crate a cell for each key
        targetted_groups.forEach((k,i)=>{
            let body_cell= document.createElement("td")
            body_cell.innerText= obj[k] //val of key
            if(k==="Name"){
                body_cell.className="name"
            }
            body_row.appendChild(body_cell)
        })
        tab_body.appendChild(body_row)
    })

    //append header and bdoy to table
    table.appendChild(tab_header)
    table.appendChild(tab_body)
    //append table to DOM
    div.appendChild(table)
    }


    function create_section_toggles(){
        //all
        let all_title= document.querySelector("#all_courses_metacont h1")
        let all_toggle_cont=document.createElement("span")
        all_toggle_cont.id="all_toggle_cont"
        let all_toggle= document.createElement("button")
        all_toggle.id="all_toggle_btn"
        all_toggle.innerHTML="↑"

        all_toggle.addEventListener("click",()=>{
            //hide list and plot
            let all_list=document.getElementById("all_courses_list")
            let all_plot=document.getElementById("all_courses_cont")



            if(all_list.style.display==="block" || all_list.style.display===""){
                all_list.style.display="none"
                all_plot.style.display="none"
                all_toggle.innerHTML="↓"

            }else if (all_list.style.display==="none"){
                all_list.style.display="block"
                all_plot.style.display="block"
                all_toggle.innerHTML="↑"
                

            }
        })

        //click

        //append
        all_toggle_cont.appendChild(all_toggle)
        all_title.insertBefore(all_toggle,all_title.firstChild)

        //personal
        let personal_title= document.querySelector("#personal_courses_metacont h1")
        let personal_toggle_cont=document.createElement("span")
        personal_toggle_cont.id="personal_toggle_cont"
        let personal_toggle= document.createElement("button")
        personal_toggle.id="personal_toggle_btn"
        personal_toggle.innerHTML="↑"

        personal_toggle.addEventListener("click",()=>{
            //hide list and plot
            let personal_list=document.getElementById("personal_courses_list")
            let personal_plot=document.getElementById("personal_courses_cont")



            if(personal_list.style.display==="block" || personal_list.style.display===""){
                personal_list.style.display="none"
                personal_plot.style.display="none"
                personal_toggle.innerHTML="↓"

            }else if (personal_list.style.display==="none"){
                personal_list.style.display="block"
                personal_plot.style.display="block"
                personal_toggle.innerHTML="↑"
            }
        })

        //click

        //append
        personal_toggle_cont.appendChild(personal_toggle)
        personal_title.insertBefore(personal_toggle,personal_title.firstChild)
    }


    function create_links_from_h3(){
        let clear_= document.getElementById("clear_")
        let infos_= document.getElementById("infos_")
        let download_= document.getElementById("download_")

        clear_.addEventListener("click",()=>{
            chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                var activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, {"message": "clear"});
            });
        })

        infos_.addEventListener("click",()=>{
            chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                var activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, {"message": "infos"});
            });
        })

        download_.addEventListener("click",()=>{
            chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                var activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, {"message": "download"});
            });
        })

    }
})
