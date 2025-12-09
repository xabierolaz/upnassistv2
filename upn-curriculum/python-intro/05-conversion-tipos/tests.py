import main
import pytest

def test_casting(capsys):
    captured = capsys.readouterr()
    output = captured.out
    
    # 1. Suma
    # 123 + 7 = 130
    assert "130" in output, "No veo el resultado de la suma (130)"
    
    # 2. Concatenación
    assert "El precio es: 9.99" in output, "El mensaje del precio no es correcto"
