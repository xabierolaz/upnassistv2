#!/bin/bash
for i in $(seq -w 01 11); do
  echo "--nup 1x2 Sesion_"$i".pdf --outfile Sesion_"$i"_printable.pdf"
  pdfjam --nup 1x2 Sesion_"$i".pdf --outfile Sesion_"$i"_printable.pdf
done