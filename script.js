// Draw each of the days of the commit graph as pixels
function drawPixels() {
  const graph = document.getElementById("graph");
  var date = new Date();
  var dayOfWeek = date.getDay();
  
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - (365 + dayOfWeek - 1));
  console.log(startDate);
  
  for(var i=0; i<7; i++) {
    var row = document.createElement("div");
    row.className = "row";
    for(var j=0; j<52; j++) {     
    
      if(i > dayOfWeek && j == 51) { break; }
      
      var pixel = document.createElement("div");
      var commitDate = new Date(startDate);
      commitDate.setDate(startDate.getDate() + (j*7 + i));
      
      pixel.className = "pixel";
      // YYYY-MM-DD
      // Also hey, months in JS are 0 indexed so we need to +1 those
      pixel.dataset.date = commitDate.getFullYear() + "-" + 
                          ('0' + (commitDate.getMonth() + 1)).slice(-2) + "-" +
                          ('0' + commitDate.getDate()).slice(-2);
      
      row.appendChild(pixel);
    }
    graph.appendChild(row);
  }
}

// I'm lazy I wanted to programmatically set the background of these items
function setPenColors() {
  document.querySelectorAll('.pen').forEach(function(item){
    item.style.backgroundColor = item.dataset.color;
  });
}

// Set the color we are drawing with
function setColor(element) {
  penColor = element.dataset.color;
}

// Set the pixel to the color
function draw(element) {
  element.style.backgroundColor = penColor;
}

function setUp() {
  drawPixels();
  setPenColors();
  
  document.getElementById("generation_form").addEventListener("submit", generateScript, false);
  
  document.addEventListener('mouseover', function(event) {
    if(event.target.classList.contains('pixel')) {
      if(drawing) { draw(event.target); }
    }
  });
  
  document.addEventListener('mouseup', function(event) {
    drawing = false;
  });
  
  document.getElementById("graph").addEventListener('mousedown', function(event) {
    drawing = true;                          
  });
  
  document.addEventListener('click', function (event) {
    if(event.target.classList.contains('pen')) {
        setColor(event.target);
    }
    
    if(event.target.classList.contains('pixel')) {
      draw(event.target);
    }
  }, false);
}

// I stole this from stackoverflow, which is why the formatting blows
// Sorry, I love whitespace in my code and one true brace style
function rgbToHex(col)
{
    if(col.charAt(0)=='r')
    {
        col=col.replace('rgb(','').replace(')','').split(',');
        var r=parseInt(col[0], 10).toString(16);
        var g=parseInt(col[1], 10).toString(16);
        var b=parseInt(col[2], 10).toString(16);
        r=r.length==1?'0'+r:r; g=g.length==1?'0'+g:g; b=b.length==1?'0'+b:b;
        var colHex='#'+r+g+b;
        return colHex;
    }
}

function generateScript(e) {
  e.preventDefault();
  var maxCommits = parseInt(document.getElementById('max_commits').value, 10);
  var repoName = document.getElementById('repo_name').value;
  var login = document.getElementById('github_login').value;
  
  var commitUnit = Math.ceil(maxCommits / 4);
  
  var color_map = [
    {color: "#c6e48b", commits: commitUnit},
    {color: "#7bc96f", commits: commitUnit * 2},
    {color: "#239a3b", commits: commitUnit * 3},
    {color: "#196127", commits: commitUnit * 4}
  ]
  
  var timeString = "T12:00:00";
  var commitString = ' git commit --allow-empty -m "Rewriting History!" > /dev/null\n';
  
  var scriptString = "#!/bin/bash\n";
  scriptString += "git init " + repoName + "\n";
  scriptString += "cd " + repoName + "\n";
  scriptString += "touch README.md\n";
  scriptString += "git add README.md\n";
  
  document.querySelectorAll('.pixel').forEach(function(item){
    color_map.forEach(function(mapping){
      if(mapping.color == rgbToHex(item.style.backgroundColor)) {
        var pixelDate = item.dataset.date;
        for(var i=0; i<mapping.commits; i++) {
          scriptString += "GIT_AUTHOR_DATE=" + pixelDate + timeString;
          scriptString += " GIT_COMMITER_DATE=" + pixelDate + timeString;
          scriptString += commitString
        }
      }
    })
  });
  
  scriptString += "git remote add origin git@github.com:" + login + "/" + repoName + ".git\n";
  scriptString += "git pull origin master\n";
  scriptString += "git push -u origin master";
  
  var downloadButton = document.createElement('a');
  downloadButton.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(scriptString));
  downloadButton.setAttribute('download', 'art.sh');
  document.body.appendChild(downloadButton);
  downloadButton.click();
}

const defaultColor = "#ebedf0";
var penColor = "#196127";
var drawing = false;
setUp();