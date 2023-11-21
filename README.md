# unipi-ai4society-plan-assistant

A Chrome extension to enhance the accessibility of the training page of the National PhD in Artificial Intelligence for Society.

🛒
Go get it on the [Chrome store](https://chromewebstore.google.com/u/1/detail/unipi-ai4society-plan-ass/fkjlneadfmkcmopndhhhcoidilahgpai?hl=it&pli=1)!

:warning:
**This extension only works on https://phd-ai-society.di.unipi.it/training/**.

If on the wrong page, **the user can be redirected to the right page simply by clicking on the extension icon**.
_____
## Main page
![](https://github.com/FrancescoDiCursi/unipi-ai4society-plan-assistant/blob/main/preview%20imgs/img1.png?raw=true)

- Select the courses by clicking on the checkbox above each title
  
- Use the shortcut buttons to handle the plan directly on the main page. Hover on buttons to see their functions.
  
   - **(?) Guide button**: it opens a new tab showing this guide;
     
   - **(⟳) Refresh button**: it refreshes the selected courses;
     
   - **(ⓘ) Show plan info**: it opens a popup showing 4 counters

     (i.e., number of selected elements and their hours for all courses, those with and without exam)

     The button is red if the thresholds are not reached, green otherwise.

  - **(⭳) Export button**: download the study plan. Follow the popups to choose among filtered or integral data and TXT or CSV format.
    
  - **(💾) Import button**: import the study plan, either a TXT or CSV file (the same obtained with the download button).

Note: The same functionalities are made avaiable in the extension popup also.

## Extension popup
- Click on the extension icon to show the extension popup;
  
- The popup is made of 3 sections:
  
  1- **Category handlers**;
  
  2- **All courses**;
  
  3- **Personal courses**;
  
In the extension popup the user can:

  - **Filter through category handlers**:

    ![](https://github.com/FrancescoDiCursi/unipi-ai4society-plan-assistant/blob/main/preview%20imgs/img2.png?raw=true)

    Click on "Toggle category handlers" and insert a progressive integer for the wanted dimensions, then click on "Plot categories" to save the changes.

    The chosen dimensions (along with their order) are shown at the bottom of this section, in the following format:

       - dimension_1 > dimension_2 > ... > dimension_N (max 3 or 4 suggested)
  
    NOTE: each integer must be different! For unwanted dimensions use 0 or an empty input.

  - **Visualize and filter courses through a hierachical plot**:

    ![](https://github.com/FrancescoDiCursi/unipi-ai4society-plan-assistant/blob/main/preview%20imgs/img3.png?raw=true)

    The plot displays the chosen dimensions.

    By clicking on elements within each category, the user can highlight a path across the entire plot, using the selection to filter the relative table.

    By hovering on the paths between axis, the user can see a counter for that path.

    In order to remove selections, click on the selected elements or reset all selections by clicking on "Reset selection".

    ![](https://github.com/FrancescoDiCursi/unipi-ai4society-plan-assistant/blob/main/preview%20imgs/img4.png?raw=true)

    Click on the arrows in the table header to sort the table based on a single column.

    Click on the names in the table to go to the course page.

    Click on "Open" or "Close" to show or hide a section.

    Finally, click on the links outside the table to perform the same actions avaiable on the main page (e.g., "Go to the guide", "Clear all selections", ...) 
      
_____
# Do you want to help?

This extension is an amatourish product made in order to practice my skills and to help others. **I do not have the time to carefully style it** (i.e., it seems to come straight from 2000 🙈).

**If you are a designer, or you are passionate about styling digital products, contact me here on github in the "Issues" section in order to suggest a more appealing style**.

 Any help would be appreciated 🤙
