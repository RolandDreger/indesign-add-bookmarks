# Add Bookmarks to Your InDesign Document

The “addBookmarks.jsx” script automatically inserts bookmarks into an Adobe InDesign document. You can choose from: paragraph style, character style, or a GREP expression to search for.

<img width="1920" height="1056" alt="Adobe InDesign workspace with a modal dialog titled “Add Bookmarks” open over a document. The dialog shows bookmark levels and paragraph styles in a list, with buttons such as “Check,” “Refresh,” and “Close,” plus options like “Include numbering” and “Parent Bookmark.” The document page and InDesign panels are visible in the background." src="https://github.com/user-attachments/assets/f9c5d495-d240-47e4-9361-fc1db1db1708" />


## Usage

1. Download the script via Code ‣ Download ZIP
2. Put the unzipped script file in into the script folder of InDesign.
3. Start the script addBookmarks.jsx from the script panel via double click.

### Video

[Using export tags for bookmark structure](https://vimeo.com/1196911557)

## Refresh

Click “Refresh” if you've switched documents while the dialog box is open or if you've created a new style.

## Delete Unused Text Anchors

The script uses text anchors when creating bookmarks to allow jumping to the desired location in the text. If the bookmarks are deleted manually (instead of using the “Undo”), these destinations remain in the document. They can be used to create bookmarks manually or removed entirely:

1. Go to: Window → Interactive → Hyperlinks 
2. Select the panel menu icon → Delete Unused Destinations

# Support

You can support the script development via **PayPal** [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=roland%2edreger%40a1%2enet&lc=AT&item_name=Roland%20Dreger%20%2f%20Donation%20for%20script%20development%20add-bookmarks&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)  or **GitHub Sponsors** (button in the right sidebar). 

# License

[MIT](http://www.opensource.org/licenses/mit-license.php)
