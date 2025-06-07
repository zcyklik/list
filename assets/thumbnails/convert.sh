for file in *.webp; do
  magick "$file" -resize 50% "${file%.*}.png"
  rm "$file"
done

