import SearchClient from './SearchClient';

export const metadata = {
    title: 'Discover Music | My Audio App',
};

export default function SearchPage() {
    return (
        <main className="page-wrapper">
            {/* If you have a Navigation component, it goes here */}
            <div className="search-main">
                <div className="search-header">
                    <h1 className="search-title">Discover</h1>
                    <p className="search-subtitle">Search for your favorite songs, artists, and albums.</p>
                </div>
                
                <SearchClient />
            </div>
        </main>
    );
}