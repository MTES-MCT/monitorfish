import unittest

from src.pipeline.flows.heartbeat import flow


class TestHeartbeatFlow(unittest.TestCase):
    def test_flow(self):
        flow.schedule = None
        flow.run()
