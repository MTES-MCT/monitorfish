import main


def test_main():
    """
    This test is useful mainly to test the import of the module and check that there
    are no errors when importing config and flows.
    """
    assert main.PROJECT_NAME == "Monitorfish"
