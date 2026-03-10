import { useState, useEffect, useMemo } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { fetchUserGeneratedImages, type UserGeneratedImage } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, EmptyState, UpgradeBanner, Lightbox } from './TemplatesPage';

interface DisplayImage {
  id: number;
  url: string;
  name?: string;
  date?: string;
  imageNumber?: number;
}

function getImageTitle(image: DisplayImage): string {
  const parts: string[] = [];
  if (image.date) {
    const d = new Date(image.date);
    parts.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  }
  if (image.imageNumber) parts.push(`Image ${image.imageNumber}`);
  return parts.length > 0 ? parts.join(' - ') : (image.name || 'Image');
}

export default function ImagesPage() {
  const { user, isPaid } = useUser();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<DisplayImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<DisplayImage | null>(null);

  useEffect(() => {
    if (!user) return;
    const start = new Date().toISOString().split('T')[0];
    const end = new Date(Date.now() + 31 * 86400000).toISOString().split('T')[0];

    fetchUserGeneratedImages(user.id, start, end, 100, 0)
      .then((data) => {
        const items = (data.items || []).map((item: UserGeneratedImage) => ({
          id: item.id,
          url: item.image,
          name: item.name,
          date: item.date,
          imageNumber: item.content_image_number,
        }));
        items.sort((a: DisplayImage, b: DisplayImage) => {
          const cmp = (a.date || '').localeCompare(b.date || '');
          return cmp !== 0 ? cmp : (a.imageNumber || 1) - (b.imageNumber || 1);
        });
        setImages(items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const { todayImages, futureImages } = useMemo(() => ({
    todayImages: images.filter((img) => img.date === today),
    futureImages: images.filter((img) => img.date !== today),
  }), [images, today]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="py-4">
      <PageHeader title="Image Library" />

      {!isPaid && (
        <div className="flex items-center gap-2 mb-4 text-sm text-[var(--color-text-secondary)]">
          <ImageIcon size={18} />
          <span>Sample images for trial members</span>
        </div>
      )}

      {/* Today's Images - horizontal scroll */}
      {isPaid && todayImages.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-2">Today's Images</h3>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {todayImages.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="shrink-0 w-[60%] sm:w-[calc((100%-24px)/3)] rounded-xl overflow-hidden"
              >
                <img src={img.url} alt="" className="w-full aspect-square object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Future / All Images - grid */}
      {(isPaid ? futureImages : images).length > 0 && (
        <>
          {isPaid && futureImages.length > 0 && (
            <h3 className="text-base font-semibold mb-2">Next 30 Days</h3>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {(isPaid ? futureImages : images).map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="rounded-lg overflow-hidden aspect-square"
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </>
      )}

      {images.length === 0 && (
        <EmptyState icon={<ImageIcon size={48} />} message="No images available yet" />
      )}

      {!isPaid && images.length > 0 && <UpgradeBanner featureName="personalized images" />}

      {selectedImage && (
        <Lightbox
          src={selectedImage.url}
          onClose={() => setSelectedImage(null)}
          title={getImageTitle(selectedImage)}
          downloadLabel={`${selectedImage.name || `sss-image-${selectedImage.id}`}.jpg`}
        />
      )}
    </div>
  );
}
