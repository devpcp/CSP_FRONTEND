// pages/401.js
import Head from "next/head";
export default function Custom401() {
    return (
        <div>
            <Head>
                <title>401 Unauthorized</title>
            </Head>
            <img src="/assets/images/401.png" alt />
            <h1>401 Unauthorized</h1>

            <style global>{`
              * {
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                }

                body {
                    text-align: center;
                    margin: 0;
                    background: linear-gradient(120deg, #04afe3 0%, #12b5e9 100%);
                    background-repeat: no-repeat;
                    background-attachment: fixed;
                    color: #fff;
                }

                img {
                    width: 250px;
                    margin: auto;
                    padding-top: 3em;
                }

                h1 {
                    font-weight: 200;
                    font-size: 4em;
                    margin: 1em;
                    color: #fff;
                }

                p {
                    font-size: 1.2em;
                }
            `}</style>
        </div>
    )
}