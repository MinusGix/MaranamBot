Explains the root config.json file.  
`rootModulesFolderName`: `String | 0`  
If it is `0` then it inherits from "modulesFolderName"  
This is what the root modules folder is called. The root being where `main.js` is located.
`modulesFolderName`: `String`  
The name of the modules folder for every submodule.  
`moduleMainFile`: `String`  
The name of the main file of a module. If there is a folder inside the root modules folder it's assumed to be a larger module, and the code only looks for this moduleMainFile inside of it. (And the submodules folder if it has one)  