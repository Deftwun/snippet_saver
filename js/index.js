var selectedSnippet ="", 
    editor, 
    menuCollapsed = false, 
    notepadCollapsed= true;

//Snippets Container
var snippets = {};

//Create a new snippet with a given name. 
//@name if the name already exists, a unique integer will be appended
//@content can be undefined
function createNewSnippet(name,content){
  var suffix = 1,
      unique = name;
  while(Object.keys(snippets).indexOf(unique) > -1){
    unique = name + "_" + suffix++;
  }  
  snippets[unique] = content || "'Hello World!'";
  selectedSnippet = unique;
  refreshSnippetsList();
}

//Updates the snippet name to whatever is in the snippet header
function updateSnippetName(){
    var newName = $("#snippet-header").val();
    if (newName.trim() != "" && selectedSnippet != newName && selectedSnippet != undefined){
      var content = snippets[selectedSnippet];
      delete snippets[selectedSnippet];
      createNewSnippet(newName,content);
      $(".snippets").addClass("selected");
    }
}

//Delete the currently seelected snippet
function deleteCurrentSnippet(){
  var prevSelect = $(".selected").prev();
  delete snippets[selectedSnippet];
  selectedSnippet="";
  prevSelect.trigger("click");
  refreshSnippetsList();
}

//Display currently selected snippet in editor
function displayCurrentSnippet(){
  if (snippets[selectedSnippet]!=undefined){
     editor.setValue(snippets[selectedSnippet]);
     $("#snippet-header").val(selectedSnippet);
  }
  else {
    editor.setValue("");
    $("#snippet-header").val("");
  }
}

//Toggles menu collapsed
function toggleMenu(){
  menuCollapsed = !menuCollapsed;
  var leftPane = $("#menu-container"),
      margin = parseInt(leftPane.css("margin-left")),
      width = parseInt(leftPane.css("width")),
      newMargin= margin < 0 ? 0 : -width;
  $("#menu-container").animate({'margin-left':newMargin});
  var button = $("#toggle-menu i")
  if (menuCollapsed) {button.removeClass("fa-arrow-circle-left");
                            button.addClass("fa-arrow-circle-right");}
  else {button.removeClass("fa-arrow-circle-right");
             button.addClass("fa-arrow-circle-left");}
}

//Toggles Notepad collapsed
function toggleNotepad(){
  notepadCollapsed = !notepadCollapsed;
  var pane = $("#notepad"),
      margin = parseInt(pane.css("margin-right")),
      width = parseInt(pane.css("width")),
      newMargin= margin < 0 ? 0 : -width;
  $("#notepad").animate({'margin-right':newMargin});
  var button = $("#toggle-notepad i");
  if (notepadCollapsed) {button.removeClass("fa-arrow-circle-right");
                            button.addClass("fa-arrow-circle-left");}
  else {button.removeClass("fa-arrow-circle-left");
             button.addClass("fa-arrow-circle-right");}
}

//Show the 'Settings' menu
function showSettings(){
  $("#snippets-menu").hide();
  $("#settings-menu").show();
}

//Hide the 'Settings' Menu
function hideSettings(){
  $("#snippets-menu").show();
  $("#settings-menu").hide();
}

//Apply options from the settings menu
function applySettings(){
  editor.setTheme($("#theme").val());
  editor.getSession().setMode($("#mode").val());
  editor.renderer.setShowGutter($("#show_gutter").is(":checked"));
  editor.renderer.setShowPrintMargin($("#display_print_margin").is(":checked"));
  $("#snippet-editor").css('font-size',$("#fontsize").val());
}

//Filters out snippet names in list based on search string
function filterList(){    
  var filterText = $("#filter").val().toLowerCase();
  var name,content;
  $(".snippet").each(function(){
      name = $(this).text();
      content = snippets[name];
      var match = name.toLowerCase().indexOf(filterText) > -1 || 
                  content.toLowerCase().indexOf(filterText) > -1;
      if (match) $(this).show();
      else $(this).hide();
  });
}

//Update list of snippet names in left pane
function refreshSnippetsList(){
  $("#filter").val("");
  $('.snippet').remove();
  for (name in snippets){
    var elem = '<div class="snippet">' + name + '</div>';
    $("#snippet-list").append(elem);
    if (selectedSnippet == name){
      $(".snippet").last().trigger("click");
    }
  }
  displayCurrentSnippet();
}

//Load snippets from storage
function loadSnippets(){
  var snippetSave = JSON.parse(localStorage.getItem("snippetSave"));
  snippets = JSON.parse(snippetSave.snippets);
  var notes = JSON.parse(snippetSave.notes);
  $("#notepad textarea").val(notes);
  refreshSnippetsList();
}

//Save snippets to storage
function saveSnippets(){
  var snippetsStr = JSON.stringify(snippets),
      notesStr = JSON.stringify($("#notepad textarea").val()),
      snippetSave = JSON.stringify({snippets:snippetsStr,notes:notesStr});
  localStorage.setItem('snippetSave',snippetSave);
}

$(document).ready(function(){

  //Create Editor (Pretty sure this must be created before doing anything else)
  editor = ace.edit("snippet-editor");
  editor.$blockScrolling = Infinity; //<< Removes ace warning message (scroll to cursor on change)
  applySettings();
 
  //Editor save on change event
  editor.getSession().on('change', function(e) {
    if (selectedSnippet.trim() == "" && editor.getValue().trim != "") return;
    snippets[selectedSnippet] = editor.getValue();
  });
  
  //Load snippets from storage on refresh
  loadSnippets();
  refreshSnippetsList();
  
  //Snippet name click event
  $(document).on("click",".snippet",function(){
    $('.snippet').removeClass("selected");
    $(this).addClass("selected");
    selectedSnippet = $(this).text();
    displayCurrentSnippet();
  });
  
  //Keep panel margins where they should be on window resize
  $(window).resize(function(){
    var setMarginNote = notepadCollapsed ? parseInt($("#notepad").css('width')) *-1 : 0,
        setMarginMenu = menuCollapsed ? parseInt($("#menu-container").css('width'))*-1 : 0;   
    $("#notepad").css({'margin-right':setMarginNote});
    $("#menu-container").css({'margin-left':setMarginMenu});
  });
});