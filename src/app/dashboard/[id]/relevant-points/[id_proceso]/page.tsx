'use client'
import 'material-symbols';
import axios from "axios";
import { useEffect, useState } from "react";
import RelevantPointsSS from '@/app/components/RelevantPointsSS';
import RelevantPoints from '@/app/components/RelevantPoints';
import Link from 'next/link';
import AiQuestion from '@/app/components/AiQuestion';
import WorkingLoader from '@/app/components/WorkingLoader';


export default function Subject(resumen: any) {

    const [contenido, setContenido] = useState<any[]>([]);
    const contenidoLS = JSON.parse(localStorage.getItem(`rpoints_${resumen.params.id_proceso}`) ?? '[]');
    const firstquery = localStorage.getItem(`firstvisit_${resumen.params.id_proceso}`);

    const [folder, setFolder] = useState('');
    const [subject, setSubject] = useState('');

    const [question, setQuestion] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [answer, setAnswer] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        getResume(); //obtengo nombre de carpeta y nombre de asunto para el breadcumb
        getProcess(); //obtengo pregunta
    }, [])

    //get folder and subject name from the resume--------------------------------------------------------------------------------------
    const getResume = async () => {
        const resParam = { key: 'id_proceso', paramId: resumen.params.id_proceso, urlSlug: "ai/consultaResumen" };
        const { data } = await axios.post('/api/auth/endpoint', resParam);

        setFolder(data.carpeta);
        setSubject(data.proceso);
    }

    //get the pregunta from proceso-----------------------------------------------------------------------------------------------------
    const getProcess = async () => {
        const resumeParam = { key: 'id_proceso', paramId: resumen.params.id_proceso, urlSlug: "api/consultaProceso" };
        const { data } = await axios.post('/api/auth/endpoint', resumeParam);

        setContenido(data.contenido);
        console.log(data);
        localStorage.setItem(`rpoints_${resumen.params.id_proceso}`, `${JSON.stringify(data.contenido)}`);//guardar la consulta en el localstorage
    }

    //obtener la respuesta segun la pregunta escrita en text input------------------------------------------------------------------------
    const getQuestionFromInput = (e: any) => {
        setQuestion(e.target.value);
    }
    const sendTheQuestion = async (e: any) => {
        e.preventDefault();
        setLoading(!loading);
        setTitle(question);
        const resumeParam = { key: 'id_proceso', keyQuestion: 'pregunta', paramId: resumen.params.id_proceso, paramPregunta: question, urlSlug: "ai/preguntaIA" };

        await axios.post('/api/auth/endpoint', resumeParam)
            .then(response => {
                setAnswer(response.data.respuesta);
                setTimeout(() => {
                    setLoading(false);
                }, 900);                
                setQuestion('');
            })

    }

    return (
        <div className="page-body py-2 px-4 w-full min-h-full">
            <div className="w-full my-4">
                <div className="flex justify-between items-center">
                    <div className='flex gap-3 items-center'>
                        <h3 className='text-gray-seven dark:text-white-one text-[22px]'>{subject}</h3>
                    </div>

                    <div className="flex gap-3 items-center">
                    </div>
                </div>
            </div>

            <div className="breadcumb mt-4">
                <div className='flex items-center text-custom-regular text-gray-seven dark:text-white-one gap-2'>
                    <Link href={'/dashboard'}><span className="material-symbols-outlined text-[16px] text-blue-one font-extralight">hard_drive</span> Archivo</Link> /
                    <Link href={`/dashboard/${resumen.params.id}`}>{folder}</Link> /
                    <Link href={`/dashboard/${resumen.params.id}/relevant-points/${resumen.params.id_proceso}`}>{subject}</Link>
                </div>
            </div>

            <hr className='h-[1px] border-0 w-full bg-gray-three my-3' />

            {/***************************************************************SEARCHBAR****************************************************************************************/}
            <div className="w-full flex items-center gap-2">
                <div className="search-bar bg-gray-one dark:bg-gray-three rounded-lg flex items-center w-full">

                    <div className="relative inline-block text-left">
                        <div className="inline-flex w-full justify-center items-center gap-x-1.5 bg-gray-one dark:bg-secundary-c border border-gray-one dark:border-gray-three rounded-lg px-2 py-[9px] ring-gray-300 hover:bg-gray-50">
                            <span className="material-symbols-outlined text-[32px] text-gray-four">
                                gavel
                            </span>
                        </div>
                    </div>

                    <form className="w-full" action="">
                        <div className='flex'>
                            <input
                                type="text"
                                className="w-full bg-main-text-color dark:bg-gray-three text-[17px] text-gray-one py-[17px] px-[10px] leading-[18px] outline-0"
                                placeholder="Da una instrucción a Noctua&reg;, sobre este asunto"
                                onChange={getQuestionFromInput}
                                value={question}

                            />
                            <div className="bg-gray-one dark:bg-secundary-c border border-gray-one dark:border-gray-three rounded-lg h-[52px] p-2 flex items-center justify-center">
                                <button className="flex items-center justify-center" onClick={sendTheQuestion}>
                                    <span className="material-symbols-outlined text-[32px] text-gray-four">
                                        chat
                                    </span>
                                </button>
                            </div>
                        </div>
                    </form>

                </div>
                <div className=" dark:bg-white bg-secundary-c rounded-full p-2 w-[52px] h-[52px] flex justify-center items-center">
                    <a className="flex items-center justify-center" href="#">
                        <span className="material-symbols-outlined text-[30px] text-white dark:text-secundary-c font-light">
                            notifications
                        </span>
                    </a>
                </div>
            </div>
            {/*******************************************************************************************************************************************************/}

            {
                answer !== '' ?
                    loading ?
                        <WorkingLoader />
                        :
                        <AiQuestion pregunta={title} respuesta={answer} />
                    :
                    ''
            }
            {
                firstquery === null ? //si no se ha visitado por primera vez, llamar IA preguntaConcepto
                    contenido.map((cont, index) => (
                        < RelevantPoints key={index} title={cont.concepto} pregunta={cont.pregunta} idPregunta={cont.id_pregunta} idProceso={resumen.params.id_proceso} />
                    ))
                    : firstquery === 'true' ? //si ya se consultó a la IA preguntaConcepto, render las respuesta desde el proceso
                        <RelevantPointsSS preguntas={contenido} idProceso={resumen.params.id_proceso} />
                        : //cargar desde el localstorage
                        <RelevantPointsSS preguntas={contenidoLS} idProceso={resumen.params.id_proceso} />


            }
        </div>
    )
}