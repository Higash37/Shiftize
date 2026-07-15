
import React, { useState, useEffect, useRef } from "react";
import { Image, ImageProps, View, StyleSheet, Platform } from "react-native";
import "./OptimizedImage.css";

interface OptimizedImageProps extends Omit<ImageProps, "source" | "src"> {

  src: string | { uri: string };

  alt?: string;

  placeholder?: React.ReactNode;

  fallback?: React.ReactNode;

  lazy?: boolean;

  threshold?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  placeholder,
  fallback,
  lazy = true,
  threshold: _threshold = 200,
  style,
  ...props
}) => {

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const imageRef = useRef<View>(null);

  useEffect(() => {
    if (!lazy || shouldLoad) return;

    if (Platform.OS === "web") {

      setShouldLoad(true);
      return;
    }

    const checkVisibility = () => {
      if (!imageRef.current) return;

      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, 100);

      return () => clearTimeout(timer);
    };

    const timer = setTimeout(checkVisibility, 0);
    return () => clearTimeout(timer);
  }, [lazy, shouldLoad]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const source = typeof src === "string" ? { uri: src } : src;

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  if (Platform.OS === "web") {
    return (
      <View style={style} ref={imageRef}>
        {isLoading && placeholder && (
          <View style={StyleSheet.absoluteFill}>{placeholder}</View>
        )}
        {/* @ts-ignore - Web専用プロパティ */}
        <img
          src={typeof src === "string" ? src : src.uri}
          alt={alt}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className="optimized-image-web"
        />
      </View>
    );
  }

  return (
    <View style={style} ref={imageRef}>
      {isLoading && placeholder && (
        <View style={[StyleSheet.absoluteFill, styles.placeholderContainer]}>
          {placeholder}
        </View>
      )}
      {shouldLoad && (
        <Image
          source={source}
          onLoad={handleLoad}
          onError={handleError}
          style={[styles.image, isLoading && styles.imageLoading]}
          {...props}
        />
      )}
      {hasError && fallback && (
        <View style={StyleSheet.absoluteFill}>{fallback}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageLoading: {
    opacity: 0,
  },
});
