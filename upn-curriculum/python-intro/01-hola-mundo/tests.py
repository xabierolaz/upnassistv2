import sys
import pytest
import main

def test_ejercicios_print(capsys):
    captured = capsys.readouterr()
    output = captured.out.strip()
    
    # Check 1
    assert "¡Hola Mundo!" in output, "Falta el mensaje '¡Hola Mundo!'"
    
    # Check 2
    assert 'Este es un string "str"' in output, "Falta la frase con comillas dobles internas"
    
    # Check 3 (Multiline)
    assert "Linea 1" in output and "Linea 2" in output and "Linea 3" in output, "Faltan las 3 líneas del ejercicio final"
    # Verificar que usó \n contando los print? Es difícil estáticamente, pero verificamos el output.