import React, { useLayoutEffect, useRef, useState } from 'react'
import { Cookies } from 'react-cookie'

const Cookie = () => {
    const firstUpdate = useRef(true);
    const [stateCookie, setStateCookie] = useState(false);
    const cookie = new Cookies();

    useLayoutEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            setStateCookie(cookie.get('yes') ? true : false);
            return;
        }
    }, [])

    const acceptCookie = () => {
        cookie.set("yes", true);
        setStateCookie(true);
    }

    return (
        <>
            <div className="my-cookie" style={{ display: `${stateCookie ? "none" : "block"}` }}>
                <p className="txt-cookie">เว็บไซต์นี้ใช้ &quot;คุกกี้&quot; เพื่อวัตถุประสงค์ในการพัฒนาการเข้าถึงบริการของผู้ใช้ให้ดียิ่งขึ้น หากต้องการเปิดใช้งานคุกกี้</p>
                <p className="txt-cookie">โปรดคลิก &quot;ยอมรับ&quot; คุณสามารถถอนการยินยอมของคุณได้ตลอดเวลา โดยไปที่ &quot;การตั้งค่าคุกกี้&quot;</p>
                <button onClick={acceptCookie} className="button-accept txt-cookie">ยอมรับคุกกี้</button>
                {/* <div id="mydiv1" className="close-cookies">x</div> */}
            </div>

            <style jsx global>{`
            
               
          
            `}</style>
        </>
    )
}

export default Cookie
