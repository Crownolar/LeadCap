import { MapPin, MapPinned } from "lucide-react";
import Map from "../other/Map";

const demoSamples = [
  {
    id: 1,
    market: "Oshodi market",
    lga: "lagos",
    state: "Lagos state",
    leadLevel: 500,
    coordinates: { lat: 43.56, lng: 35.6 },
    comments: [
      {
        name: "Dr Adeniran",
        comment: "I think the lead level is a bit too high",
        date: "18 - 03 - 2025",
        time: "3:45 pm",
      },
      {
        name: "Dr Elijah",
        comment: "Yes, the lead level is too high",
        date: "18 - 03 - 2025",
        time: "1:35 pm",
      },
    ],
  },
  {
    id: 2,
    market: "Oshodi market",
    lga: "lagos",
    state: "Lagos state",
    leadLevel: 800,
    coordinates: { lat: 43.56, lng: 35.6 },
    comments: [],
  },

  {
    id: 3,
    market: "Araromi market",
    lga: "ijebu",
    state: "Osun state",
    leadLevel: 2000,
    coordinates: { lat: 13.56, lng: 5.6 },
    comments: [
      {
        name: "Professor Isa",
        comment:
          " I like it very much, I think you should consider hiring Abdulrahman, he is an Agba you know.",
        date: "19 - 03 - 2025",
        time: "2:15 pm",
      },
    ],
  },
  {
    id: 4,
    market: "Lautech market",
    lga: "ilega",
    state: "Ibadan state",
    leadLevel: 100,
    coordinates: { lat: 11.56, lng: 30.6 },
  },
  {
    id: 5,
    market: "Lautech market",
    lga: "ilega",
    state: "Ibadan state",
    leadLevel: 200,
    coordinates: { lat: 11.56, lng: 30.6 },
  },
  {
    id: 6,
    market: "Oja Oba market",
    lga: "ilorin",
    state: "kwara state",
    leadLevel: 500,
    coordinates: { lat: 45.56, lng: 23.6 },
    comments: [
      {
        name: "Dr Emmanuel",
        comment: "Im going o need an O2 level scan in your analysis",
        date: "20 - 03 - 2025",
        time: "3:55 pm",
      },
    ],
  },
];

const MapView = ({ theme, samples = demoSamples }) => {
  return (
    <div
      className={`${theme?.card} ${theme?.text} rounded-lg shadow-md p-6 border ${theme?.border}`}
    >
      <h2 className='text-xl font-semibold mb-4'>Geographic Distribution</h2>
      <div className='space-y-4'>
        {samples?.filter((s) => s?.coordinates?.lat && s?.coordinates?.lng)
          .length === 0 && (
          <div className='text-center py-12'>
            <MapPin className='w-16 h-16 mx-auto mb-4 text-gray-400' />
            <p className={theme?.textMuted}>
              No samples with GPS coordinates yet
            </p>
          </div>
        )}
        <Map samples={samples} />
      </div>
    </div>
  );
};

export default MapView;
