"use client";

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useProfileData } from '../utils/jwtUtils';
import BarCard from '@/components/ui/barcard';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';

type Bar = {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    operatingHours: string;
    owner: {id: string};
    type: any;
};

const Home = () => {
    const profileData = useProfileData();
    const [establishments, setEstablishments] = useState<Bar[]>([]);
    const [limit, setLimit] = useState<number>(12);
    const [offset, setOffset] = useState<number>(5);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    useEffect(() => {
        // Cargar los primeros bares al inicio
        fetchEstablishments();
        // Añadir el evento de scroll para cargar más bares al llegar al final de la página
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [offset, limit]);

    const fetchEstablishments = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/establishments/all?limit=${limit}&offset=0`);
            setEstablishments(response.data);
            if (response.data.length < limit) {
                setHasMore(false);
            }
            
            setOffset(response.data.length); // Establece el siguiente offset para cargar más bares
            setLoading(false);
        } catch (error) {
            console.error('Error fetching establishments:', error);
            setLoading(false);
        }
    };

    const fetchMoreEstablishments = async () => {
        
      if (!hasMore || loading) return;

        try {
            setLoading(true);
            const response = await api.get(`/establishments/all?limit=${limit}&offset=${offset}`);
            console.log("ANTES",establishments);
            
            setEstablishments((prevEstablishments) => [...prevEstablishments, ...response.data]);
            console.log("DESPUES",establishments);
            
            if (response.data.length < limit) {
                setHasMore(false);
            }
            
            setOffset((prevOffset) => prevOffset + limit); // Incrementar el offset
            setLoading(false);
        } catch (error) {
            console.error('Error fetching more establishments:', error);
            setLoading(false);
        }
    };

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1 && hasMore) {
            fetchMoreEstablishments(); // Cargar más bares al llegar al final
        }
    };

    const handleAddEstablishment = () => {
        window.location.href = '/add-establishment';
    };

    const renderClientView = () => (
        <div className="flex flex-col items-center min-h-screen">
            <div className="flex flex-col items-center justify-between w-full p-4 bg-gray-100 border-b">
            <h1 className="flex text-xl font-bold justify-center text-gray-700 m-3">Bienvenido, {profileData?.name}</h1>
                <h1 className="text-3xl font-bold text-center">Bares Disponibles</h1>
            </div>
            <div className="container mx-auto">
            {establishments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 justify-center mt-2">
                    {establishments.map(bar => (
                        <BarCard
                            key={bar.id}
                            id={bar.id}
                            name={bar.name}
                            description={bar.description}
                            imageUrl={'https://via.placeholder.com/400x300'}
                            operatingHours={bar.operatingHours}
                            isOwner={false}
                            type={bar.type}
                        />
                    ))}
                    {loading && <Loader></Loader>}
                    {!hasMore && <p>No hay más establecimientos disponibles.</p>}
                </div>
                    ) : (<div className='flex flex-col h-screen justify-center'>
                        <div className='flex justify-center items-center'>No hay establecimientos disponibles.</div>
                        <div className='flex justify-center items-center'>Prueba a crear uno tú mismo creándote una cuenta Owner.</div></div>
            )}
            </div>
        </div>
    );
    
    const renderOwnerView = () => {
        // Filtrar los bares que pertenecen al propietario actual
        const ownerestablishments = establishments.filter(bar => bar.owner.id === profileData?.id);
    
        return (
            <div className="flex flex-col items-center min-h-screen">
                <div className="flex flex-col items-center justify-between w-full p-4 bg-gray-100 border-b">
                    <h1 className="text-xl font-bold text-gray-700">Bienvenido, {profileData?.name}</h1>
                    <div className="flex justify-center w-full">
                        <Button onClick={handleAddEstablishment}>+ Añadir Establecimiento</Button>
                    </div>
                </div>
                <div className="flex flex-col justify-center mt-6"> 
                    <h1 className="flex text-xl justify-center font-bold text-gray-700">Tus establecimientos</h1>
                    {ownerestablishments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 justify-center">
                            {ownerestablishments.map(bar => (
                                <BarCard
                                    key={bar.id}
                                    id={bar.id}
                                    name={bar.name}
                                    description={bar.description}
                                    imageUrl={'https://via.placeholder.com/400x300'}
                                    operatingHours={bar.operatingHours}
                                    isOwner={true}
                                    type={bar.type}
                                />
                            ))}
                        </div>
                    ) : (
                        <p>No tienes establecimientos disponibles.</p>
                    )}
                </div>
            </div>
        );
    };
    
  

    const renderWaiterView = () => {
        return (
        <div className="flex min-h-screen flex-col items-center bg-cover">
            {profileData?.establishment ? (<div className="container mx-auto">
                <h1 className="text-xl font-bold text-center text-gray-700 mb-2 mt-8">Bienvenido, {profileData?.name}</h1>
                <h1 className="text-3xl font-bold text-center ">Tu Panel de Camarero</h1>
                <h2 className="text-xl font-bold text-center my-3">Establecimiento: {profileData?.establishment?.name}</h2>
                <div className="flex w-full flex-col h-96 justify-center space-y-4">
                    <Button className="flex w-1/2" onClick={() => window.location.href = `/e/${profileData?.establishment?.id}`}>Ver Establecimiento</Button>
                    <Button className="flex w-1/2" onClick={() => window.location.href = `/e/${profileData?.establishment?.id}/tables`}>Ver Mesas</Button>
                </div>
            </div>) : 
            <div className="container mx-auto">
            <h1 className="text-xl font-bold text-center text-gray-700 mb-2 mt-8">Bienvenido, {profileData?.name}</h1>
            <h1 className="text-3xl font-bold text-center ">Todavía no tienes asignado un establecimiento.</h1>
            
        </div>
            }
        </div>
        );
    }

    const renderAdminView = () => {
        return (
            <div className="flex min-h-screen flex-col items-center  bg-cover">
                <div className="flex flex-col items-center justify-between w-full p-4 bg-gray-100 border-b">
                    <h1 className="text-3xl font-bold text-center mt-8">Panel de Administrador</h1>
                    <h2 className="text-xl font-bold text-center my-3">Gestiona los Establecimientos y Usuarios</h2>
                </div>
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 justify-center mt-6">
                        {establishments.map(bar => (
                            <BarCard
                                key={bar.id}
                                id={bar.id}
                                name={bar.name}
                                description={bar.description}
                                imageUrl={'https://via.placeholder.com/400x300'}
                                operatingHours={bar.operatingHours}
                                isOwner={true} // Como admin, no es el dueño pero puede gestionar
                                type={bar.type}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            {profileData?.roles === 'CLIENT' && renderClientView()}
            {profileData?.roles === 'OWNER' && renderOwnerView()}
            {profileData?.roles === 'WAITER' && renderWaiterView()}
            {profileData?.roles === 'ADMIN' && renderAdminView()}
        </div>
    );
};

export default Home;
