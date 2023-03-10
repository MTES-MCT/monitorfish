from src.pipeline.flows.ports import compute_active_ports


def test_compute_active_ports():
    active_ports = compute_active_ports.run()
    assert len(active_ports) == 6

    assert set(active_ports.port_locode) == {
        "FRZJZ",
        "FRDPE",
        "FRDKK",
        "FRLEH",
        "FRCQF",
        "FRBES",
    }

    assert set(active_ports.is_active) == {
        True,
        True,
        True,
        True,
        True,
        True,
    }
