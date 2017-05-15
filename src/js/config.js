module.exports = [
  { 
    "type": "heading", 
    "defaultValue": "Example Header Item" 
  }, 
  { 
    "type": "text", 
    "defaultValue": "Example text item." 
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "This is a section"
      },
      {
        "type": "input",
        "appKey": "email",
        "label": "Email Address"
      },
      {
        "type": "input",
        "appKey": "psswd",
        "label": "Password"
      },
      {
        "type": "input",
        "appKey": "transTag",
        "label": "Tag"
      },
      {
        "type": "submit",
        "defaultValue": "Save"
      }
    ]
  }
]