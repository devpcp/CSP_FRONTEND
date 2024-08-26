import React from 'react'

const CarPreloader = () => {
    /**
     * License!!
     * Copyright (c) 2023 by shantanu (https://codepen.io/shantanudl/pen/VwYgzvY)
        Fork of an original work Car loader | CSS Loading animation (https://codepen.io/karstenmarijnissen/pen/oqjXRz

        Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

        The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     */

    return (
        <div className="car-loader">
              <svg className="car" width="20%" height="auto" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
                 {/* <svg className="car" width="102" height="40" xmlns="http://www.w3.org/2000/svg"> */}
                     <g transform="translate(2 1)" stroke="#002742" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                         <path className="car__body" d="M47.293 2.375C52.927.792 54.017.805 54.017.805c2.613-.445 6.838-.337 9.42.237l8.381 1.863c2.59.576 6.164 2.606 7.98 4.531l6.348 6.732 6.245 1.877c3.098.508 5.609 3.431 5.609 6.507v4.206c0 .29-2.536 4.189-5.687 4.189H36.808c-2.655 0-4.34-2.1-3.688-4.67 0 0 3.71-19.944 14.173-23.902zM36.5 15.5h54.01" stroke-width="3" />
                         <ellipse className="car__wheel--left" stroke-width="3.2" fill="#FFF" cx="83.493" cy="30.25" rx="6.922" ry="6.808" />
                         <ellipse className="car__wheel--right" stroke-width="3.2" fill="#FFF" cx="46.511" cy="30.25" rx="6.922" ry="6.808" />
                         <path className="car__line car__line--top" d="M22.5 16.5H2.475" stroke-width="3" />
                         <path className="car__line car__line--middle" d="M20.5 23.5H.4755" stroke-width="3" />
                         <path className="car__line car__line--bottom" d="M25.5 9.5h-19" stroke-width="3" />
                     </g>
                 </svg>
    </div>
    )
}

export default CarPreloader
