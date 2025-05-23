// ✅ app/head.tsx
export default function Head() {
    return (
      <>
        <title>AidLink</title>
        <meta name="description" content="AidLink – decentralized aid distribution platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY`}
          async
          defer
        />
      </>
    );
  }
  