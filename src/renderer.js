const path = require('path');
const fs = require('fs');

function readFirstLine(filePath, callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            callback(null); // Call the callback with null if there's an error
            return;
        }

        // Extract the first line
        const firstLine = data.split('\n')[0].trim();
        callback(firstLine); // Call the callback with the first line
    });
}

function displayNotes(notes, searchTerm) {
    const notesContainer = document.querySelector('.notes-container .note'); // Target the inner note container
    console.log("Search Term: " + searchTerm);
    notes.forEach(note => {
        // Read the first line of the note file
        const filePath = note.filePath;
        readFirstLine(filePath, (firstLine) => {
            // Check if searchTerm exists and is not empty
            if (searchTerm && searchTerm.trim() !== '') {
                // Check if the first line contains the searchTerm
                if (firstLine && firstLine.toLowerCase().includes(searchTerm.toLowerCase())) {
                    const noteButton = document.createElement('button');
                    noteButton.classList.add('note-button');
                    const fileName = firstLine || 'Untitled Document'; // If the first line is empty, set filename to "Untitled Document"
                    noteButton.textContent = fileName; // Set the button text to the filename

                    // Add click event listener to each note button
                    noteButton.addEventListener('click', function() {
                        fetchNoteContent(note.filePath);
                    });

                    notesContainer.appendChild(noteButton);
                }
            } else {
                const noteButton = document.createElement('button');
                noteButton.classList.add('note-button');
                const fileName = firstLine || 'Untitled Document'; // If the first line is empty, set filename to "Untitled Document"
                noteButton.textContent = fileName; // Set the button text to the filename

                // Add click event listener to each note button
                noteButton.addEventListener('click', function() {
                    fetchNoteContent(note.filePath);
                });

                notesContainer.appendChild(noteButton);
            }
        });
    });
}



function fetchNoteContent(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading note file ${filePath}:`, err);
            return;
        }
        
        // Encode both content and filename
        const encodedContent = encodeURIComponent(data);
        const encodedFilename = encodeURIComponent(path.basename(filePath));

        // Construct the URL with both query parameters
        const url = `note.html?content=${encodedContent}&filename=${encodedFilename}`;

        // Redirect to the note.html page with the encoded content and filename
        window.location.href = url;
    });
}


function loadNotes(searchTerm) {
    console.log("Loading Notes");
    const savedNotesFolder = path.join(__dirname, 'savedNotes');

    fs.readdir(savedNotesFolder, (err, files) => {
        if (err) {
            console.error('Error reading savedNotes folder:', err);
            return;
        }

        const allNotes = [];

        files.forEach(file => {
            const filePath = path.join(savedNotesFolder, file);

            allNotes.push({ filePath: filePath });

            if (allNotes.length === files.length) {
                console.log("displaying")
                displayNotes(allNotes, searchTerm);
            }
        });
    });
}


function goToNewNotePage() {
    const uniqueFilename = generateUniqueFilename();
    saveNewNote(uniqueFilename);
    
    // Set the content of the note-content element to an empty string
    const noteContentElement = document.getElementById('note-content');
    if (noteContentElement) {
        noteContentElement.value = ''; // Set the value to empty string
    }

    // Redirect to the new note page
    window.location.href = `note.html?filename=${uniqueFilename + ".txt"}`;
}


function saveNewNote(uniqueFilename) {
    const savedNotesFolder = path.join(__dirname, 'savedNotes');
    const newFilePath = path.join(savedNotesFolder, uniqueFilename + ".txt");

    fs.writeFile(newFilePath, "", (err) => {
        if (err) {
            console.error('Error saving new note:', err);
        } else {
            console.log('New note saved successfully!');
        }
    });
}

function saveNote() {
    console.log('Saving Note...');

    const urlParams = new URLSearchParams(window.location.search);
    const uniqueFilename = urlParams.get('filename');

    if (!uniqueFilename) {
        console.error('Unique filename not found in URL.');
        return;
    }

    const noteContentElement = document.getElementById('note-content');
    if (!noteContentElement) {
        console.error('Note content element not found.');
        return;
    }

    const newNoteContent = noteContentElement.value;

    const savedNotesFolder = path.join(__dirname, 'savedNotes');
    const existingFilePath = path.join(savedNotesFolder, uniqueFilename);

    // Check if the file exists
    if (!fs.existsSync(existingFilePath)) {
        console.error('Note file not found:', existingFilePath);
        return;
    }

    // Update the content of the existing note file
    fs.writeFile(existingFilePath, newNoteContent, (err) => {
        if (err) {
            console.error('Error updating note:', err);
        } else {
            console.log('Note updated successfully!');
        }
    });

    // Redirect back to index.html
    window.location.href = 'index.html';
}

// Function to delete the note
function deleteNote() {
    // Retrieve the filename
    const urlParams = new URLSearchParams(window.location.search);
    const filename = urlParams.get('filename');

    // Assuming you're using Node.js and fs module to delete the file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'savedNotes', filename);

    // Delete the file
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting note:', err);
            return;
        }
        console.log('Note deleted successfully!');
        // Redirect to the index page or any other appropriate page
        window.location.href = 'index.html';
    });
}

function generateUniqueFilename() {
    const timestamp = Date.now();
    return timestamp.toString();
}

function countWords(text) {
    const words = text.trim().split(/\s+/);
    return words.filter(word => word !== '').length;
  }
  
  // Update word count when the content changes
  function updateWordCount() {
    const content = document.getElementById('note-content').value;
    const wordCount = countWords(content);
    document.getElementById('word-count').textContent = `Word count: ${wordCount}`;
  }
  

// Function to download the note content as a text file
function downloadNote() {
    // Retrieve the filename from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const filename = urlParams.get('filename');
  
    // If filename is not available, fallback to a default name
    const downloadFileName = filename ? `${filename}` : 'note.txt';
  
    const noteContent = document.getElementById('note-content').value;
    const blob = new Blob([noteContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName; // Set the filename for download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }


  
  // Function to handle file upload
function handleFileUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'text/plain';
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file.type === 'text/plain') { // Check if the file type is plain text
            const reader = new FileReader();

            // Callback function when file reading is complete
            reader.onload = function(event) {
                const content = event.target.result;
                const fileName = generateUniqueFilename(); // Generate unique filename
                const filePath = path.join(__dirname, 'savedNotes', fileName + ".txt"); // Adjust the file path as needed

                // Write the file to the file system
                fs.writeFile(filePath, content, (err) => {
                    if (err) {
                        console.error('Error saving file:', err);
                    } else {
                        console.log('File uploaded and saved as:', fileName);
                    }
                });
                loadNotesAndUpdate();
            };

            // Read the file as text
            reader.readAsText(file);
        } else {
            console.error('Invalid file type. Please upload a text file.');
        }
    });

    fileInput.click();
}
  

function loadNotesAndUpdate() {
    // Remove all existing buttons
    const existingButtons = notesContainer.querySelectorAll('.note-button');
    existingButtons.forEach(button => {
        notesContainer.removeChild(button);
    });

    const searchTerm = searchInput.value;
    loadNotes(searchTerm);
}