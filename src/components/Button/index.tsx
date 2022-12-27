import * as React from "react";



interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    disabled?: boolean;
}


const Button: React.FC<ButtonProps> = ({className, ...props}) => {

    
    return (
        <button className="bg-buttonColor rounded text-buttonTextColor px-[24px] text-[14px] py-[10px] disabled:bg-slate-700 disabled:text-white" {...props} />
    )
}

export default Button;
