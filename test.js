let courses_nodes=document.getElementsByClassName("views-row")
//add to each course: a checkbox with two inputs (Sure/Maybe) and a button to clear the inputs
// counter for n_selection: all, with exam (min 3), with no exam [red if doesnt respect constraints, green otherwise]
// counter for hours: all, with exam (min 80), with no exam (min 60)   [red if doesnt respect constraints, green otherwise]


//a tree map with a customizable path having as vars, unordered: Institution, Type, Attendance Mode, Exam, Semester, Hours
// possibly insert the link in the text of the deeper elements.

//a button to export the selections either as a csv or txt:
    // csv with all vars as columns
    // txt: same structure of the html