import { useEffect, useRef, useState } from 'react';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

const FLOWS = [
  {
    id: 'fixed',
    label: 'Fixed Flow',
    subtitle: 'Hardcoded Node.js decision tree',
    file: '/bpmn/fixed-flow.bpmn',
    color: '#0f766e',
    description: 'No BPMN runtime. The backend calls the mock credit check API and routes with if-else: score >= 700 auto-approve, 400-699 manager review, score < 400 auto-reject.',
  },
  {
    id: 'bpmn1',
    label: 'BPMN Simple',
    subtitle: 'HTTP Task plus manager review',
    file: '/bpmn/credit-card-simple.bpmn',
    color: '#2563eb',
    description: 'Flowable executes the HTTP Task, stores the credit check as process variables, then routes: score >= 700 auto-approve, 450-699 manager review, score < 450 auto-reject.',
  },
  {
    id: 'bpmn2',
    label: 'BPMN Advanced',
    subtitle: 'Manager plus director approval',
    file: '/bpmn/credit-card-advanced.bpmn',
    color: '#b45309',
    description: 'Stricter BPMN flow. Auto-approve threshold is 750; medium scores require manager approval followed by director approval.',
  },
];

function BpmnCanvas({ file, color }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const xml = await fetch(file).then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.text();
        });

        if (viewerRef.current) viewerRef.current.destroy();
        const viewer = new BpmnViewer({ container: containerRef.current });
        viewerRef.current = viewer;

        await viewer.importXML(xml);
        if (cancelled) return;

        viewer.get('canvas').zoom('fit-viewport', 'auto');
        const elementRegistry = viewer.get('elementRegistry');
        elementRegistry.forEach(el => {
          if (el.type === 'bpmn:UserTask' || el.type === 'bpmn:ServiceTask') {
            const gfx = elementRegistry.getGraphics(el);
            const rect = gfx?.querySelector('.djs-visual rect');
            if (rect) rect.style.stroke = color;
          }
        });
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (containerRef.current) load();

    return () => {
      cancelled = true;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [file, color]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
          Loading diagram...
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: 13 }}>
          Error: {error}
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default function WorkflowViewer() {
  const [active, setActive] = useState('fixed');
  const flow = FLOWS.find(f => f.id === active);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Workflow Viewer</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Compare the hardcoded credit-card flow against two BPMN engine definitions.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FLOWS.map(f => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: active === f.id ? `2px solid ${f.color}` : '2px solid #e2e8f0',
              background: active === f.id ? `${f.color}15` : '#fff',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: active === f.id ? f.color : '#374151' }}>
              {f.label}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{f.subtitle}</div>
          </button>
        ))}
      </div>

      <div style={{
        padding: '10px 16px',
        background: `${flow.color}10`,
        borderLeft: `4px solid ${flow.color}`,
        borderRadius: '0 6px 6px 0',
        marginBottom: 12,
        fontSize: 13,
        color: '#374151',
      }}>
        <strong style={{ color: flow.color }}>{flow.label}:</strong> {flow.description}
      </div>

      <div style={{
        flex: 1,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        overflow: 'hidden',
        border: `1px solid ${flow.color}30`,
        minHeight: 400,
      }}>
        <BpmnCanvas key={flow.file} file={flow.file} color={flow.color} />
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 12, color: '#94a3b8', flexWrap: 'wrap' }}>
        <span>Scroll to zoom</span>
        <span>Drag to pan</span>
        <span>User Task, Service Task, Gateway, Start/End</span>
      </div>
    </div>
  );
}
