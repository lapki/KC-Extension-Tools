# KC-Extension-Tools
A lightweight script with the intention of adding the features of Dollchan with native KC support and no GM_* functions

### Modules

* Autoreload   - Reload threads via ajax
* Backlinks    - Add backlinks to posts when replied to
* Hover View   - Display posts when replies are hovered over
* Thread links - Display links at the bottom of a thread, e.g [Return]

### Creating a module

KC extension tools uses prototypes for modules. 

    function Module() { }
    Module.prototype.init = function () { //code here }
In order to call your module add it to the config first. e.g:

    config = {
                Module : 1
    }

Then you will need to call it:

     if (config['Module'] == 1) {

	     module = new Module();

	     module.init();
         }
         
 In the future the config will be the basis for a menu where features can be toggled on and off like on 8chan.       
