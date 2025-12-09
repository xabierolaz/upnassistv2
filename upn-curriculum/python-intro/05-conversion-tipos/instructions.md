# Sesión 1: Conversión de Tipos (Casting)

## Teoría
A veces tienes un número guardado como texto (`"50"`) y quieres sumar algo. Si lo intentas, Python dará error.
Debes **convertirlo**.

*   `int("50")` -> `50` (Entero)
*   `float("3.14")` -> `3.14` (Real)
*   `str(100)` -> `"100"` (Texto)

---

### Misión: Ejercicios 37 y 41 (Lab01)
1.  Tienes la cadena `texto_numero = "123"`. Conviértela a entero, súmale 7 e imprime el resultado.
2.  Concatena texto con números:
    *   Declara `precio = 9.99`.
    *   Imprime el mensaje: `"El precio es: " + str(precio)`. (Nota que necesitas convertir el precio a string para concatenar con `+`).
