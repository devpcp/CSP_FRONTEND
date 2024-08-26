import { useSelector } from 'react-redux';

const Fieldset = ({ legend, children, className, style }) => {
    const { mainColor } = useSelector(({ settings }) => settings);
    return (
        <div className={className} style={style}>
            <fieldset className="border p-2">
                <legend className="w-auto">{legend}</legend>
                <div className='pl-5 pr-5'>
                    {children}
                </div>
            </fieldset>
            <style jsx global>
                {`
                    .border {
                        border: 2px solid ${mainColor} !important;
                    }
                    legend {
                        padding: 10px;
                        color: ${mainColor} !important;
                    }
                `}
            </style>
        </div>
    )
}

export default Fieldset