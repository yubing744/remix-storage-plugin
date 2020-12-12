import React from 'react'
import { useBehaviorSubject } from 'use-subscribable'
import { fileservice } from '../../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile, faFolder } from '@fortawesome/free-solid-svg-icons'
import './FileExplorer.css'
import { fileExplorerNode } from './types';
import { StatusButtons } from './statuses';
import { FileButtons } from './Buttons';

interface FileExplorerProps {
    setTab: (key:string) => void
}



export const FileExplorer: React.FC<FileExplorerProps> = (props) => {
    
    const files = useBehaviorSubject(fileservice.filetreecontent)

    fileservice.filetreecontent.subscribe((x)=>{console.log(files)}).unsubscribe()

    const getFileStatus = function(file:fileExplorerNode){
        let result = fileservice.getFileStatusForFile((file.fullname || ""))
        console.log("file status",file,result)
        return <StatusButtons statuses={result}/>
    }

    const renderChildren = function(files:fileExplorerNode){
        return <li>{files.type === `dir`?<FontAwesomeIcon icon={faFolder} />:<FontAwesomeIcon icon={faFile} />}<span className='pr-1'/>{files.name}
        
        {(files || {children:[]} ).children?.map((x:any)=>{
              return <ul key={x.id} id="filetree">
                  {renderChildren(x)}
              </ul>
        })}
        
        <FileButtons setTab={props.setTab} file={files}/>
        {getFileStatus(files)}
        </li>
    }

      return (
          <>
         
          <h2>Files</h2>
          <div className="alert alert-info" role="alert">Files will be added automatically from the IDE when you change, add or
        save them.</div>
          {(files || {children:[]} ).children?.map((x:any)=>{
              return <ul key={x.id} id="filetree">
                  {renderChildren(x)}
              </ul>
          })}

        </>
      );
}

