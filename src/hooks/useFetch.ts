import {useEffect, useState} from "react";

const useFetch = <T>(url: string) =>  {

    const [data,setData] = useState<T | null>(null)
    const [isLoading,setIsLoading] = useState<boolean>(true)
    const [error,setError] = useState<string | null >(null)

    useEffect(() => {

        const controller = new AbortController();


        fetch(url, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Ошибка загрузки');
                }
                return response.json();
            })

            .then((result: T) => {
                setData(result);
                setError(null);
                setIsLoading(false)
            })

            .catch((err) => {
                if (err instanceof Error && err.name === 'AbortError') return;
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
                setIsLoading(false);
            })


        return () => {controller.abort()}
    }, [url]);


    return { data, isLoading, error };
}

export default useFetch