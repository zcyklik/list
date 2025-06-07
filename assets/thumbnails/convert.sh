for file in *.webp; do
  magick "$file" "${file%.*}.png"
  rm "$file"
done

