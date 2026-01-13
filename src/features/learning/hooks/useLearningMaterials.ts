import { useState, useEffect } from 'react';
import { learningApi } from '../services/learningApi';
import { LearningMaterial, LearningMaterialsResponse } from '../types';

export const useLearningMaterials = (page: number = 0, size: number = 10) => {
  const [data, setData] = useState<LearningMaterialsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Learning] Fetching materials...');
      const response = await learningApi.getAllMaterials(page, size);
      console.log('[Learning] Response:', JSON.stringify(response, null, 2));
      setData(response);
    } catch (err: any) {
      console.error('[Learning] Error fetching materials:', err);
      setError(err.message || 'Failed to fetch learning materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [page, size]);

  return { data, loading, error, refetch: fetchMaterials };
};

export const useLearningMaterialsByCategory = (category: string, page: number = 0, size: number = 10) => {
  const [data, setData] = useState<LearningMaterialsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await learningApi.getMaterialsByCategory(category, page, size);
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch materials by category');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category && category !== 'All') {
      fetchMaterials();
    }
  }, [category, page, size]);

  return { data, loading, error, refetch: fetchMaterials };
};

export const useSearchLearningMaterials = (query: string, page: number = 0, size: number = 10) => {
  const [data, setData] = useState<LearningMaterialsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMaterials = async () => {
    if (!query || query.length < 3) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await learningApi.searchMaterials(query, page, size);
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && query.length >= 3) {
        searchMaterials();
      } else {
        setData(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, page, size]);

  return { data, loading, error };
};

export const useLearningMaterialDetail = (id: number) => {
  const [data, setData] = useState<LearningMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Learning] Fetching material detail:', id);
      const response = await learningApi.getMaterialById(id);
      console.log('[Learning] Material detail fetched:', response);
      setData(response);
    } catch (err: any) {
      console.error('[Learning] Error fetching material detail:', err);
      setError(err.message || 'Failed to fetch material details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMaterial();
    }
  }, [id]);

  return { data, loading, error, refetch: fetchMaterial };
};
