import React, { memo } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const MakedownEditor = ({ label, value, changeValue, name, invalidFields, setInvalidFields }) => {

    const handleEditorChange = (content, editor) => {
        changeValue(prev => ({ ...prev, [name]: content }));
    };

    return (
        <div className='relative flex flex-col'>
            <span>{label}</span>
            <Editor
                apiKey={process.env.REACT_APP_MCETINY}
                initialValue={value}
                init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
                onEditorChange={handleEditorChange}
                onFocus={() => setInvalidFields && setInvalidFields([])}
            />
            {invalidFields?.some(el => el.name === name) && (
                <small className='text-main text-sx absolute bottom-[-16px]'>
                    {invalidFields.find(el => el.name === name)?.message}
                </small>
            )}
        </div>
    );
}

export default memo(MakedownEditor);
